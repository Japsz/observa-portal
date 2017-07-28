
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
exports.del_comment = function (req,res) {
    if(req.session.isUserLogged){
        input.iduser = req.session.user.iduser;
        req.getConnection(function(err,connection){
            connection.query('DELETE FROM comentario WHERE idcomentario = ? AND iduser = ?',[req.params.idcom,req.session.user.iduser],function(err,rows)
            {
                if(err) {
                    console.log("Error Deleting : %s ",err );
                    res.send("no");
                } else
                    res.send("si");
                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
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
exports.edit = function(req, res){

    if(req.session.isUserLogged){

        res.render('cdd_edit',{data: req.session.user,usr:req.session.user});
    }
};
exports.save_edit = function(req, res){

    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            username : input.username,
            password : req.session.user.password,
            tipo : req.session.user.tipo,
            nombre : input.name,
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
exports.edit_f = function(req, res){

    if(req.session.isUserLogged){

        res.render('f_login',{data: req.session.user,usr:req.session.user});
    }
};
exports.save_edit_f = function(req, res){

    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            username : input.username,
            password : input.pass,
            tipo : req.session.user.tipo,
            nombre : input.name,
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