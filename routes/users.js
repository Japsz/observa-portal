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
	req.session.isUserLogged = false;
    req.session.user = 'undefined';
	res.redirect('/');
};

exports.admin_logout = function(req, res){
	req.session.isAdminLogged = false;
	res.redirect('/');
};

exports.user_login_handler = function(req, res){

	var input = JSON.parse(JSON.stringify(req.body));

	var username = input.username;
	var password = input.password;

    req.getConnection(function(err,connection){
        if(err)
            console.log("Error Selecting : %s ",err );
          connection.query('SELECT * FROM user WHERE username = ? AND password = ?',[username,password],function(err,rows)
          {
          	  if(rows.length == 0 || rows[0].tipo == 4){
          	  	console.log('Invalid Username or Password.');
          	  	res.redirect('/bad_login');
          	  }

              if(err)
                  console.log("Error Selecting : %s ",err );
              
              if(rows.length == 1){

                  req.session.user = rows[0];
                  req.session.isUserLogged = true;
                  if(rows[0].tipo == 3 && rows[0].nombre == null){
                      res.redirect("/f_login");
                  } else res.redirect("/indx");
              }
          });
           
           //console.log(query.sql);
	});
  
};
exports.get_monit = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err,connection){

        connection.query('SELECT * FROM user WHERE correo LIKE ? AND tipo = 1',[input.corr + "%"],function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );

            res.render("monit_stream",{data : rows});
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
              	req.session.isAdminLogged = true;
              	res.redirect('/instit');
              }
          });
           //console.log(query.sql);
    });
  
};


