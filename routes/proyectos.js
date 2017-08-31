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
                res.render('proyect_indx',{data :rows, usr:req.session.user});

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.myproy = function(req, res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT proyecto.*,GROUP_CONCAT(DISTINCT tags.tag ORDER BY tags.tag) AS tagz FROM' +
                ' proyecto LEFT JOIN tagproyecto ON proyecto.idproyecto = tagproyecto.idproyecto LEFT JOIN tags ON tagproyecto.idtag = tags.idtag LEFT JOIN userproyecto ON proyecto.idproyecto = userproyecto.idproyecto' +
                ' LEFT JOIN user ON user.iduser = userproyecto.iduser WHERE user.iduser = ? GROUP BY proyecto.idproyecto ORDER BY proyecto.actualizado DESC',req.session.user.iduser,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.render('my_proy',{data :rows, usr:req.session.user});

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.getsol = function(req, res){
    var int = "show_sol";
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT solucion.*,user.username,user.avatar_pat as iconouser FROM solucion LEFT JOIN user ON user.iduser = solucion.iduser WHERE solucion.idproyecto = ? GROUP BY solucion.idsolucion ORDER BY solucion.fecha DESC',req.params.idproy,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var acts = rows;
                connection.query('SELECT group_concat(user.username , "@" , user.iduser, "@", user.avatar_pat) as usuarios,proyecto.* FROM proyecto LEFT JOIN userproyecto ON userproyecto.idproyecto = proyecto.idproyecto LEFT JOIN user ON user.iduser = userproyecto.iduser WHERE proyecto.idproyecto = ?',req.params.idproy,function(err,rows)
                {
                    if(rows.length){
                        rows[0].usuarios = rows[0].usuarios.split(",");
                        for(var i = 0; i<rows[0].usuarios.length;i++){
                            rows[0].usuarios[i] = rows[0].usuarios[i].split("@");
                            if(rows[0].usuarios[i][1] == req.session.user.iduser){
                                int = "mod_sol";
                            }
                        }
                        res.render(int,{data :acts,gral : rows[0], usr:req.session.user});
                    }

                });

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.getproy = function(req, res){
    var int = "show_proy";
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT actualizacion.*,user.username,user.avatar_pat as iconouser FROM actualizacion LEFT JOIN user ON user.iduser = actualizacion.iduser WHERE actualizacion.idproyecto = ? GROUP BY actualizacion.idactualizacion ORDER BY actualizacion.fecha DESC',req.params.idproy,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var acts = rows;
                connection.query('SELECT group_concat(user.username , "@" , user.iduser, "@", user.avatar_pat) as usuarios,proyecto.* FROM proyecto LEFT JOIN userproyecto ON userproyecto.idproyecto = proyecto.idproyecto LEFT JOIN user ON user.iduser = userproyecto.iduser WHERE proyecto.idproyecto = ?',req.params.idproy,function(err,rows)
                {
                    if(rows.length){
                        console.log(acts);
                        console.log(rows);
                        console.log(req.params.idproy);
                        rows[0].usuarios = rows[0].usuarios.split(",");
                        for(var i = 0; i<rows[0].usuarios.length;i++){
                            rows[0].usuarios[i] = rows[0].usuarios[i].split("@");
                            if(rows[0].usuarios[i][1] == req.session.user.iduser){
                                int = "mod_proy";
                            }
                        }
                        res.render(int,{data :acts,gral : rows[0], usr:req.session.user});
                    }

                });

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
                                connection.query("INSERT INTO userproyecto SET ? ",[{iduser:req.session.user.iduser,idproyecto: postid,etapa: 0}], function(err, rows)
                                {

                                    if (err)
                                        console.log("Error inserting : %s ",err );
                                    res.redirect('/lab');

                                });
                            });

                        });
                    });
                } else {
                    if(input.cat != ""){
                        connection.query("INSERT INTO tagproyecto (`idtag`, `idproyecto`) VALUES ?",[[[input.cat,postid]]], function(err, rows)
                        {

                            if (err)
                                console.log("Error inserting : %s ",err );
                            connection.query("INSERT INTO userproyecto SET ? ",[{iduser:req.session.user.iduser,idproyecto: postid,etapa: 0}], function(err, rows)
                            {

                                if (err)
                                    console.log("Error inserting : %s ",err );
                                res.redirect('/lab');

                            });

                        });
                    } else {
                        connection.query("INSERT INTO userproyecto SET ? ",[{iduser:req.session.user.iduser,idproyecto: postid,etapa: 0}], function(err, rows)
                        {

                            if (err)
                                console.log("Error inserting : %s ",err );
                            res.redirect('/lab');

                        });
                    }
                }
            });
        });
    }
};
exports.act_save = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        if(input.tipo == "4"){
            input.tit = input.tit.split("=")[1];
        }
        var data = {
            iduser: req.session.user.iduser,
            idproyecto: input.idproy,
            tipo : input.tipo,
            principal : input.tit,
            contenido: input.texto,
            fecha: new Date()
        };
        req.getConnection(function(err,connection){
            connection.query('INSERT INTO actualizacion SET ?',[data],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                connection.query('UPDATE proyecto SET actualizado = CURRENT_TIMESTAMP WHERE idproyecto = ?',input.idproy,function(err,rows){
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    console.log(rows);
                    res.redirect('/proy/get/' + input.idproy.toString());
                });

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.sol_save = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            iduser: req.session.user.iduser,
            idproyecto: input.idproy,
            etapa : input.tipo,
            contenido: input.texto,
            fecha: new Date(),
            estado: 0
        };
        req.getConnection(function(err,connection){
            connection.query('INSERT INTO solucion SET ?',[data],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.send('si');
                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};