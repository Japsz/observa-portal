exports.getproy = function(req, res){
    var int = false;
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT postinterno.*,user.username,user.avatar_pat as iconouser FROM postinterno INNER JOIN user ON user.iduser = postinterno.iduser WHERE postinterno.idproyecto = ? GROUP BY postinterno.idpostinterno ORDER BY postinterno.fecha DESC LIMIT 10',req.params.idproy,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var psts = rows;
                for(var j = 0; j<psts.length;j++){

                    if(psts[j].tipo > 1 || psts[j].tipo == 0){
                        psts[j].token = psts[j].token.split("&&");
                        if(psts[j].laiks && psts[j].laiks != "" && psts[j].laiks != "fin"){
                            psts[j].lenlaik = psts[j].laiks.split("&&").length;
                        } else {
                            psts[j].lenlaik = 0;
                        }
                    }
                }
                connection.query('SELECT group_concat(user.username , "@" , user.iduser, "@", user.avatar_pat) as usuarios,proyecto.*,etapa.token,evento.likes FROM proyecto LEFT JOIN userproyecto ON userproyecto.idproyecto = proyecto.idproyecto LEFT JOIN user ON user.iduser = userproyecto.iduser LEFT JOIN etapa ON proyecto.idevento = etapa.idevento AND etapa.nro = proyecto.etapa LEFT JOIN evento ON evento.idevento = proyecto.idevento WHERE proyecto.idproyecto = ? GROUP BY etapa.token',req.params.idproy,function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    if(rows.length){
                        rows[0].usuarios = rows[0].usuarios.split(",");
                        for(var i = 0; i<rows[0].usuarios.length;i++){
                            rows[0].usuarios[i] = rows[0].usuarios[i].split("@");
                            if(rows[0].usuarios[i][1] == req.session.user.iduser){
                                int = true;
                            }
                        }
                        if(int)
                        res.render("muro",{data :psts,gral : rows[0], usr:req.session.user});
                        else res.redirect('/bad_login');
                    }

                });

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.intern_save = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            iduser: req.session.user.iduser,
            idproyecto: input.idproy,
            tipo : input.tipo,
            fecha: new Date(),
            texto1: input.texto1,
            texto2: input.texto2,
            token: input.token.replace("&amp;",'&')
        };

        req.getConnection(function(err,connection){
            connection.query('INSERT INTO postinterno SET ?',[data],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.redirect('/intern/' + input.idproy.toString());

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.post_sol = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            iduser: req.session.user.iduser,
            tipo : input.tipo,
            texto2: input.texto2,
            fecha: new Date()
        };
        req.getConnection(function(err,connection){
            connection.query('SELECT GROUP_CONCAT(solucion.idsolucion, "&&", user.username, "&&", user.avatar_pat, "&&", solucion.fecha) as token,solucion.idproyecto, solucion.contenido FROM solucion INNER JOIN user ON solucion.iduser = user.iduser WHERE solucion.idsolucion = ? GROUP BY solucion.idsolucion LIMIT 1',[input.idsol],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                data.texto1 = rows[0].contenido;
                data.token = rows[0].token;
                data.idproyecto = rows[0].idproyecto;
                connection.query('INSERT INTO postinterno SET ?',[data],function(err,rows){
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    res.send("si");
                });
                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.progress  = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('UPDATE postinterno SET tipo = 0 WHERE idpostinterno = ?',input.idpost,function(err,rows)
            {
                if(err)
                    console.log("Error updating : %s ",err );
                res.send('si');
                //console.log(query.sql);
            });
            //console.log(query.sql);
        });
    } else res.redirect('/bad_login');
};
exports.getcomments = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

                connection.query('SELECT comentinterno.*,user.username,user.avatar_pat FROM comentinterno INNER JOIN user ON user.iduser = comentinterno.iduser' +
                    ' WHERE idpost  = ? GROUP BY comentinterno.idcomentinterno',input.idpost,function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );

                    res.render('intcmnt_stream',{data:input.idpost,usr:req.session.user,comments : rows});

                    //console.log(query.sql);
                });
                //console.log(query.sql);
        });
    } else res.redirect('/bad_login');
};
exports.save_comment = function (req,res) {
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        input.iduser = req.session.user.iduser;
        req.getConnection(function(err,connection){
            connection.query('INSERT INTO comentinterno SET ? ',[input],function(err,rows)
            {
                if(err)
                    console.log("Error Inserting : %s ",err );
                connection.query('SELECT comentinterno.*,user.username,user.avatar_pat FROM comentinterno INNER JOIN user ON user.iduser = comentinterno.iduser' +
                    ' WHERE idpost  = ? GROUP BY comentinterno.idcomentinterno',input.idpost,function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );

                    res.render('intcmnt_stream',{data:input.idpost,usr:req.session.user,comments : rows});

                    //console.log(query.sql);
                });
                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};