
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
exports.check_usr = function (req,res) {
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        if(input.username != req.session.user.username) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM user WHERE username = ?', input.username, function (err, rows) {
                    if (err ) {
                        console.log("Error Deleting : %s ", err);
                    } else if (rows.length){
                        res.send("no");
                    } else {
                        res.send("si");

                    }
                    //console.log(query.sql);
                });
            });
        } else {
            res.send("si")
        }
    } else res.redirect('/bad_login');
};
exports.intern_laik = function (req, res) {
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function (err, connection) {
            connection.query("SELECT postinterno.laiks,COUNT(userproyecto.iduser) as cantint FROM postinterno INNER JOIN userproyecto ON postinterno.idproyecto = userproyecto.idproyecto WHERE postinterno.idpostinterno = ? GROUP BY postinterno.laiks",[input.idpost], function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );
                var newlike, classname, numint, totvot;
                if(rows){
                    numint = rows[0].cantint;
                    if(rows[0].laiks){
                        if(rows[0].laiks.indexOf("&" + req.session.user.iduser + "&") != -1){
                            newlike =  rows[0].laiks.replace("&" + req.session.user.iduser + "&",'');
                            classname = "btn-inverse";
                        } else {
                            newlike = rows[0].laiks + "&" + req.session.user.iduser + "&";
                            classname = "btn-success";
                        }
                    } else {
                        newlike = "&" + req.session.user.iduser + "&";
                        classname = "btn-success";
                        }
                    connection.query("UPDATE postinterno SET laiks = ? WHERE idpostinterno = ?",[newlike,input.idpost], function(err, rows)
                    {

                        if (err)
                            console.log("Error inserting : %s ",err );
                        if(newlike == ""){
                            totvot = 0;
                        } else {
                            totvot = newlike.split("&&").length;
                        }
                        res.send({html: '<i class="glyphicon glyphicon-thumbs-up"></i>' + totvot + ' / ' + ((numint - numint%2)/2 + 1),newlaik: classname});
                    });
                } else
                    res.send("no");
            });
        });
    } else res.send("no");
};
exports.rm_laik_intern = function (req, res) {
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

        res.render('cdd_predit',{data: req.session.user,usr:req.session.user, obs: req.session.idobs});
    }
};
exports.commitedit = function(req, res){

    if(req.session.isUserLogged){

        res.render('cdd_edit',{data: req.session.user,usr:req.session.user, obs: req.session.idobs});
    }
};
exports.save_edit = function(req, res){

    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        console.log(input.avatr);
        var data = {
            avatar_pat: input.avatr,
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

        res.render('f_login',{data: req.session.user,usr:req.session.user, obs: req.session.idobs});
    }
};
exports.save_edit_f = function(req, res){

    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            avatar_pat: input.avatr,
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
                        res.redirect('/indx');
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
