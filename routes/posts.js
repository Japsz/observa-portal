/**
 * Created by benja on 26-06-2017.
 */
exports.indx = function(req, res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT post.*,user.username,GROUP_CONCAT(tags.tag ORDER BY tags.tag) AS tagz,COUNT(megusta.iduser) as likes FROM' +
                ' post LEFT JOIN tagpost ON post.idpost = tagpost.idpost LEFT JOIN tags ON tagpost.idtag = tags.idtag INNER JOIN user ON user.iduser = post.iduser' +
                ' LEFT JOIN megusta ON megusta.idpost = post.idpost GROUP BY post.idpost ORDER BY post.fecha DESC LIMIT 6',function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );

                res.render('cdd_index',{data:rows,usr:req.session.user});

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.getpost = function(req, res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT post.*,user.username,GROUP_CONCAT(tags.tag ORDER BY tags.tag) AS tagz, COUNT(megusta.iduser) as likes FROM' +
                ' post LEFT JOIN tagpost ON post.idpost = tagpost.idpost LEFT JOIN tags ON tagpost.idtag = tags.idtag INNER JOIN user ON user.iduser = post.iduser' +
                ' LEFT JOIN megusta ON megusta.idpost = post.idpost WHERE post.idpost  = ? GROUP BY post.idpost',req.params.idpost,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var post = rows[0];
                connection.query('SELECT comentario.*,user.username,user.avatar_pat FROM comentario INNER JOIN user ON user.iduser = comentario.iduser' +
                    ' WHERE idpost  = ? GROUP BY comentario.idcomentario',req.params.idpost,function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );

                    res.render('getpost',{data:post,usr:req.session.user,comments : rows});

                    //console.log(query.sql);
                });
                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
// Logica agregar post.
//    Estados
// 1 : pendiente
// 2 : aceptado
// 3 : rechazado
exports.save = function(req,res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function (err, connection) {
            if(input.tipo == "4"){
                input.tit = input.tit.split("=")[1];
            } else if (input.tipo == "1" && input.tags == "") input.tags = "idea";
            var data = {
                estado : 2,
                tipo   : input.tipo,
                iduser   : req.session.user.iduser,
                t_principal : input.tit,
                tags : input.tags.replace(/\s/g,'')
            };
            if(parseInt(input.tipo) > 1 && input.texto != ""){
                data.contenido = input.texto;
            }
            connection.query("INSERT INTO post SET ? ",data, function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );
                var postid = rows.insertId;
                if(input.tags != ""){
                    var tags = input.tags.replace(/\s/g,'').split(",");
                    var aux = [];
                        var query2 = "SELECT * FROM tags WHERE tag = ?";
                        for(var k = 0 ; k < tags.length;k++){
                            if(k >= 1){
                                query2 += " OR tag = ?";
                            }
                            aux.push([tags[k]]);
                        }
                        connection.query("INSERT INTO tags (`tag`) VALUES ?",[aux], function(err, nada)
                        {

                            if (err)
                                console.log("Error INSERTINg : %s ",err );

                            connection.query(query2,tags, function(err, tags)
                            {

                                if (err)
                                    console.log("Error selecting : %s ",err );
                                console.log(tags);
                                var query ="INSERT INTO tagpost (`idtag`, `idpost`) VALUES ?";
                                var list = [];
                                for(var i = 0; i < tags.length;i++){
                                    aux =[tags[i].idtag,postid];
                                    list.push(aux);
                                }
                                console.log(input.cat);
                                if(input.cat != ""){
                                    list.push([input.cat,postid]);
                                }
                                connection.query(query,[list], function(err, rows)
                                {

                                    if (err)
                                        console.log("Error inserting : %s ",err );

                                    res.redirect('/indx');

                                });

                            });
                        });
                } else {
                    if(input.cat != ""){
                        connection.query("INSERT INTO tagpost (`idtag`, `idpost`) VALUES ?",[[[input.cat,postid]]], function(err, rows)
                        {

                            if (err)
                                console.log("Error inserting : %s ",err );

                            res.redirect('/indx');

                        });
                    } else
                    res.redirect('/indx');
                }
            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};
exports.b_tag = function(req, res){

    req.getConnection(function(err,connection){
        var input = JSON.parse(JSON.stringify(req.body));
        input.busqueda = input.busqueda.replace(/\s/g,'').split(",");
        connection.query('SELECT post.*,GROUP_CONCAT(tags.tag ORDER BY tags.tag) AS tagz FROM' +
            ' post LEFT JOIN tagpost ON post.idpost = tagpost.idpost LEFT JOIN tags ON tagpost.idtag = tags.idtag' +
            ' WHERE tags.tag = ? GROUP BY post.idpost ORDER BY post.fecha DESC LIMIT 6',input.busqueda,function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );
            res.render('cdd_index',{data:rows,usr:req.session.user});

            //console.log(query.sql);
        });
    });

};
exports.add_laik = function (req, res) {
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function (err, connection) {
            connection.query("INSERT INTO megusta (`iduser`, `idpost`) VALUES ?",[[[req.session.user.iduser,input.idpost]]], function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );
                connection.query("SELECT * FROM megusta WHERE idpost = ?",[input.idpost], function(err, rows)
                {

                    if (err)
                        console.log("Error inserting : %s ",err );
                    var len = rows.length;
                    res.send(len.toString());

                });

            });
        });
    } else res.send("no");
};
exports.rm_laik = function (req, res) {
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function (err, connection) {
            connection.query("DELETE FROM megusta WHERE idpost = ? AND iduser = ?",[input.idpost,req.session.user.iduser], function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );
                connection.query("SELECT * FROM megusta WHERE idpost = ?",[input.idpost], function(err, rows)
                {

                    if (err)
                        console.log("Error inserting : %s ",err );

                    res.send(rows.length.toString());

                });

            });
        });
    } else res.send("no");
};
exports.get_cat = function(req, res){

    req.getConnection(function(err,connection){
        connection.query('SELECT post.*,GROUP_CONCAT(tags.tag ORDER BY tags.tag) AS tagz FROM' +
            ' post LEFT JOIN tagpost ON post.idpost = tagpost.idpost LEFT JOIN tags ON tagpost.idtag = tags.idtag WHERE tags.idtag = ? GROUP BY post.idpost ORDER BY post.fecha DESC LIMIT 6',req.params.id,function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );
            res.render('cdd_index',{data:rows,usr:req.session.user});

            //console.log(query.sql);
        });
    });

};