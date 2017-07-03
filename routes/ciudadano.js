exports.indx = function(req, res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT post.*,GROUP_CONCAT(tags.tag ORDER BY tags.tag) AS tags FROM post LEFT JOIN tagpost ON post.idpost = tagpost.idpost LEFT JOIN tags ON tagpost.idtag = tags.idtag GROUP BY post.idpost ORDER BY post.fecha DESC LIMIT 6',function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                console.log(rows[0].tags);
                res.render('cdd_index',{data:rows,usr:req.session.user});

            //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.edit = function(req, res){

    if(req.session.isUserLogged){

        res.render('cdd_edit',{data: req.session.user});
    }
};
exports.save_edit = function(req, res){

    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            username : req.session.user.username,
            password : req.session.user.password,
            tipo : req.session.user.tipo,
            name : input.name,
            apellido : input.ape,
            fnac : input.fnac,
            gender : input.gend,
            correo : input.correo

        };
        req.getConnection(function(err,connection){

            connection.query("UPDATE user set ? WHERE iduser = ? ",[data,req.session.user.iduser],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                connection.query("SELECT * FROM user WHERE iduser = ? ",[req.session.user.iduser],function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    if(rows.length == 1){
                        req.session.user = rows[0];
                        res.redirect('/cdd_edit');
                    }

                    //console.log(query.sql);
                });

                //console.log(query.sql);
            });
        });
    }
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
            }
            var data = {
                estado : 2,
                tipo   : input.tipo,
                iduser   : req.session.user.iduser,
                t_principal : input.tit
            };
            if(parseInt(input.tipo) > 1 && input.texto != ""){
                data.texto = input.texto;
            }
            connection.query("INSERT INTO post SET ? ",data, function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );
                console.log(input.tags);
                var tags = input.tags.replace(/\s/g,'').split(",");
                console.log(tags);
                if(tags.length && tags[0] != ""){
                    connection.query("SELECT * FROM post ORDER BY idpost DESC LIMIT 1", function(err, post)
                    {

                        if (err)
                            console.log("Error selecting : %s ",err );
                        var post = post[0];
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
                                var query ="INSERT INTO tagpost (`idtag`, `idpost`) VALUES ?";
                                var list = [];
                                for(var i = 0; i < tags.length;i++){
                                    aux =[tags[i].idtag,post.idpost];
                                    list.push(aux);
                                }
                                connection.query(query,[list], function(err, rows)
                                {

                                    if (err)
                                        console.log("Error inserting : %s ",err );

                                    res.redirect('/indx');

                                });

                            });
                        });
                    });
                } else {
                    res.redirect('/indx');
                }
            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};
exports.m_post = function(req,res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        res.render('modal_post',{tipo: input.tipo})
    }
    else res.redirect('/bad_login');
};