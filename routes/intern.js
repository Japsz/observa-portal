exports.getproy = function(req, res){
    var int = false;
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT postinterno.*,user.username,user.avatar_pat as iconouser FROM postinterno inner JOIN user ON user.iduser = postinterno.iduser WHERE postinterno.idproyecto = ? GROUP BY postinterno.idpostinterno ORDER BY postinterno.fecha DESC',req.params.idproy,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var psts = rows;
                for(var j = 0; j<psts.length;j++){
                    if(psts[j].tipo != 1)
                    psts[j].token = psts[j].token.split("&&");
                }
                connection.query('SELECT group_concat(user.username , "@" , user.iduser, "@", user.avatar_pat) as usuarios,proyecto.* FROM proyecto LEFT JOIN userproyecto ON userproyecto.idproyecto = proyecto.idproyecto LEFT JOIN user ON user.iduser = userproyecto.iduser WHERE proyecto.idproyecto = ?',req.params.idproy,function(err,rows)
                {
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
            token: "Describa la situación y/o problema que aborda el proyecto (causas y consecuencias)&&Señale cómo cambiará o incidirá el proyecto en cambiar la situación y/o problema identificado"
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
            fecha: new Date(),
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