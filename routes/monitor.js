// Logica agregar cdd a obs.
exports.save_cdd = function(req,res){
    if(req.session.isUserLogged && req.session.user.tipo == 1){
        var input = JSON.parse(JSON.stringify(req.body));
        var generator = require('generate-password');
        var pass = generator.generate({length : 7,numbers : true});
        if(input.correo == ""){
            res.redirect('/obs_usr/' + input.idobs);
        }
        req.getConnection(function (err, connection) {

            var data = {

                username   : input.correo.split("@")[0],
                password   : pass,
                tipo	   : 3,
                correo	   : input.correo
            };
            connection.query("INSERT INTO user SET ? ",data, function(err, rows)
            {

                if (err){
                    console.log("Error inserting : %s ",err );
                    res.redirect('/obs_usr/' + input.idobs);
                } else {
                    connection.query("INSERT INTO ciudadano SET ?",{idobs : input.idobs, iduser : rows.insertId}, function(err, rows)
                    {
                        if (err) console.log("Error Inserting cdd : %s ", err);
                        res.mailer.send('mail', {
                            to: input.correo, // REQUIRED. This can be a comma delimited string just like a normal email to field.
                            subject: 'Estás Inscrito en ObservaCiudadanía!', // REQUIRED.
                            password: pass // All additional properties are also passed to the template as local variables.
                        }, function (err) {
                            if (err) {
                                // handle error
                                console.log(err);
                                res.send('There was an error sending the email');
                                return;
                            }
                            res.redirect('/obs_usr/' + input.idobs);
                        });
                    });
                }
            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};
exports.get_obs = function(req, res){
    if(req.session.isUserLogged && req.session.user.tipo == 1){
        req.getConnection(function(err,connection){

            connection.query('SELECT * FROM observatorio WHERE idobservatorio = ?',req.params.idobs,function(err,rows)
            {

                if(err)
                    console.log("Error Selecting : %s ",err );
                var obs = rows[0];
                connection.query('SELECT user.* FROM user LEFT JOIN ciudadano ON user.iduser = ciudadano.iduser WHERE idobs = ?',req.params.idobs,function(err,rows)
                {

                    if(err)
                        console.log("Error Selecting : %s ",err );

                    res.render('get_obs',{data:rows,usr:req.session.user,obs : obs});

                });

            });
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');
};
exports.obs_monit = function(req, res){
    if(req.session.isUserLogged && req.session.user.tipo == 1){
        req.getConnection(function(err,connection){

            connection.query('SELECT * FROM observatorio WHERE idmonitor = ?',req.session.user.iduser,function(err,rows)
            {

                if(err)
                    console.log("Error Selecting : %s ",err );

                res.render('monit_obs',{page_title:"Observatorios",data:rows,usr:req.session.user});

            });
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');
};
exports.drop_cdd = function (req, res) {
    if(req.session.isUserLogged && req.session.user.tipo == 1){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function(err,connection){

            connection.query('DELETE FROM ciudadano WHERE iduser = ? AND idobs = ?',[input.iduser,input.idobs],function(err,rows)
            {

                if(err){
                    console.log("Error deleting : %s ",err );
                    res.redirect('/obs_usr/' + input.idobs);
                    return
                }
                connection.query('UPDATE user SET tipo = 4 WHERE iduser = ?',input.iduser,function(err,rows)
                {

                    if(err)
                        console.log("Error Selecting : %s ",err );
                    res.redirect('/obs_usr/' + input.idobs);

                });


            });
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');
};

