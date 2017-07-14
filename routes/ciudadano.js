
exports.save_comment = function (req,res) {
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        input.iduser = req.session.user.iduser;
        req.getConnection(function(err,connection){
            connection.query('INSERT INTO comentario SET ? ',[input],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.redirect("/post/" + input.idpost);
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

exports.m_post = function(req,res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        res.render('modal_post',{tipo: input.tipo})
    }
    else res.redirect('/bad_login');
};