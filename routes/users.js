exports.bad_login = function(req, res){
	res.render('bad_login', { title: 'Observa Ciudadanía - Auth Error' });
};

exports.user_login = function(req, res){
	res.render('user_login', { title: 'Observa Ciudadanía - User Login' });
};

exports.admin_login = function(req, res){
	res.render('admin_login', { title: 'Observa Ciudadanía - Admins Login' });
};

exports.user_logout = function(req, res){
    req.session.isAdminLogged = false;
	req.session.isUserLogged = false;
    req.session.user = 'undefined';
	res.redirect('/');
};

exports.admin_logout = function(req, res){
	req.session.isAdminLogged = false;
    req.session.isUserLogged = false;
    req.session.user = 'undefined';
    res.redirect('/');
};

exports.user_login_handler = function(req, res){

	var input = JSON.parse(JSON.stringify(req.body));
    if(input.username.split("@").length > 1){
        var query = "SELECT * FROM user WHERE correo = ? AND password = ?";
    } else {
        var query = 'SELECT * FROM user WHERE username = ? AND password = ?'
    }
	var username = input.username;

	var password = input.password;

    req.getConnection(function(err,connection){
        if(err)
            console.log("Error Selecting : %s ",err );
          connection.query(query,[username,password],function(err,users)
          {
              if(err)
                  console.log("Error Selecting : %s ",err );
          	  if(users.length == 0 || users[0].tipo == 4){
          	  	console.log('Invalid Username or Password.');
          	  	res.redirect('/bad_login');
          	  } else if(users.length == 1){
                  req.session.user = users[0];
                  var nom = users[0].nombre;

                  switch(users[0].tipo){
                      case 3:
                          connection.query('SELECT observatorio.* FROM observatorio LEFT JOIN ciudadano ON ciudadano.idobs = observatorio.idobservatorio WHERE ciudadano.iduser = ?',users[0].iduser,function (err, rows){
                              if(err) console.log("Error selecting cdd: %s",err);
                              req.session.idobs = rows;
                              req.session.isUserLogged = true;
                              console.log(rows);
                              if(nom == null){
                                  res.redirect("/f_login");
                              } else res.redirect('/indx');
                          });
                          break;
                      case 2:
                          req.session.isUserLogged = true;
                          res.redirect("/mod_indx");
                          break;
                      case 1:
                          connection.query('SELECT observatorio.* FROM observatorio LEFT JOIN monitor ON monitor.idobservatorio = observatorio.idobservatorio WHERE monitor.idmonitor = ? GROUP BY observatorio.idobservatorio',users[0].iduser,function (err, rows){
                              if(err) console.log("Error selecting obs: %s",err);
                              console.log(typeof rows);
                              console.log(rows);
                              req.session.idobs = rows;
                              req.session.isUserLogged = true;
                              res.redirect('/indx');
                          });
                          break;
                      default:
                          res.redirect('/bad_login');
                  }
              }
          });
           
           //console.log(query.sql);
	});
  
};
exports.get_obsmonit = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err,connection){

        connection.query('SELECT user.* FROM user LEFT JOIN monitor ON user.iduser = monitor.idmonitor WHERE monitor.idobservatorio = ?',[input.idobs],function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );
            var html = "";
            for(var i = 0;i<rows.length;i++){
                html += "<tr><td>" + rows[i].correo + "</td><td>" + rows[i].username + "</td><td><a class='btn btn-danger' onclick='manage_monits(" + rows[i].iduser + ',"del"' + ")'><span class='glyphicon glyphicon-remove'></span></a></td></tr>"
            }
            res.send(html);
        });
        //console.log(query.sql);
    });
};
exports.get_monit = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err,connection){

        connection.query('SELECT * FROM user WHERE (correo LIKE ? OR username LIKE ?) AND tipo = 1' +
            ' AND  iduser not in (SELECT idmonitor FROM monitor WHERE idobservatorio = ?)',[input.corr + "%",input.corr + "%",input.idobs],function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );
            var html = "";
            for(var i = 0;i<rows.length;i++){
                html += "<tr><td>" + rows[i].correo + "</td><td>" + rows[i].username + "</td><td><a class='btn btn-success' onclick='manage_monits(" + rows[i].iduser + ',"add"' + ")'><span class='glyphicon glyphicon-plus'></span></a></td></tr>"
            }
            res.send(html);
        });
        //console.log(query.sql);
    });
};
exports.admin_login_handler = function(req, res){

	var input = JSON.parse(JSON.stringify(req.body));

	var username = input.username;
	var password = input.password;

    req.getConnection(function(err,connection){
         
          connection.query('SELECT * FROM admin WHERE username = ? AND password = ?',[username,password],function(err,rows)
          {
          	  if(rows.length == 0 ){
          	  	console.log('Invalid Username or Password.');
          	  	res.redirect('/bad_login');
          	  }

              if(err)
                  console.log("Error Selecting : %s ",err );
              
              if(rows.length == 1){
                  req.session.user = rows[0];
              	req.session.isAdminLogged = true;
              	res.redirect('/instit');
              }
          });
           //console.log(query.sql);
    });
  
};
exports.add_obsmonit = function (req, res) {
    req.getConnection(function(err,connection){

        connection.query('INSERT INTO monitor SET ?',req.body,function(err,rows)
        {
            if(err){
                console.log("Error Selecting : %s ",err );
                res.send({error: true, str: "Hubo un error al agregar al monitor, Intente mas tarde"});
            }
            res.send({error: false});
        });
        //console.log(query.sql);
    });
};
exports.del_obsmonit = function (req, res) {
    req.getConnection(function(err,connection){

        connection.query('DELETE FROM monitor WHERE idmonitor = ? AND idobservatorio = ?',[parseInt(req.body.idmonitor),parseInt(req.body.idobservatorio)],function(err,rows)
        {
            if(err){
                console.log("Error Selecting : %s ",err );
                res.send({error: true, str: "Hubo un error al borrar al monitor, Intente mas tarde"});
            }
            res.send({error: false});
        });
        //console.log(query.sql);
    });
};


