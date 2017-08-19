/**
 * Created by benja on 17-08-2017.
 */
exports.indx = function(req, res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT proyecto.*,user.username,user.avatar_pat as iconouser,GROUP_CONCAT(DISTINCT tags.tag ORDER BY tags.tag) AS tagz FROM' +
                ' proyecto LEFT JOIN tagproyecto ON proyecto.idproyecto = tagproyecto.idproyecto LEFT JOIN tags ON tagproyecto.idtag = tags.idtag INNER JOIN user ON user.iduser = proyecto.idcreador' +
                '  GROUP BY proyecto.idproyecto ORDER BY proyecto.actualizado DESC LIMIT 12',function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.render('proyect_indx',{data :rows, usr:req.session.user, obs: req.session.idobs});

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.save = function(req,res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){
            var input = JSON.parse(JSON.stringify(req.body));
            var idobserva = input.idobserva;
            var data = {
                idcreador   : req.session.user.iduser,
                titulo : input.tit,
                descripcion: input.testo,
                problema: input.prob,
                media: input.media
            };
            connection.query("INSERT INTO proyecto SET ? ",data, function(err, rows)
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
                            var query ="INSERT INTO tagproyecto (`idtag`, `idproyecto`) VALUES ?";
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
                                res.redirect('/lab');

                            });

                        });
                    });
                } else {
                    if(input.cat != ""){
                        connection.query("INSERT INTO tagproyecto (`idtag`, `idproyecto`) VALUES ?",[[[input.cat,postid]]], function(err, rows)
                        {

                            if (err)
                                console.log("Error inserting : %s ",err );

                            res.redirect('/lab');

                        });
                    } else
                        res.redirect('/lab');
                }
            });
        });
    }
}
