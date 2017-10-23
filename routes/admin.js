//Vista lista de usuarios.
exports.list = function(req, res){
	if(req.session.isAdminLogged){
		req.getConnection(function(err,connection){
					 
						connection.query('SELECT * FROM user WHERE tipo != 3',function(err,rows)
						{
								
								if(err)
										console.log("Error Selecting : %s ",err );
				 
								res.render('user',{page_title:"Stats",data:rows, usr:req.session.user});
										
						 });
						 //console.log(query.sql);
				});
		}
		else res.redirect('/bad_login');  
};
exports.modproy = function(req,res){
    if(req.session.isAdminLogged){
        req.getConnection(function(err,connection){
            connection.query('SELECT postinterno.*,proyecto.titulo,user.username,user.avatar_pat as iconouser FROM postinterno LEFT JOIN proyecto ON proyecto.idproyecto = postinterno.idproyecto LEFT JOIN user ON user.iduser = postinterno.iduser WHERE postinterno.tipo = 0 GROUP BY postinterno.idpostinterno',function(err,rows)
            {

                if(err)
                    console.log("Error Selecting : %s ",err );
                if(rows.length){
                	for(var i = 0;i<rows.length;i++){
                		rows[i].token = rows[i].token.split("&&");
					}
				}
                res.render('admin/event/modproys',{page_title:"Stats",data:rows, usr:req.session.user});

            });
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');
};
exports.moderate_p = function(req,res){
    if(req.session.isAdminLogged){
        req.getConnection(function(err,connection){
        	if(req.params.resp == "si"){
        		connection.query("UPDATE postinterno SET tipo = 4 WHERE idpostinterno = ?",req.params.idpost,function(err,rows){
        			if(err) console.log("Error Updating : %s ",err);
        			connection.query("UPDATE proyecto SET gotlaik = 0, gotuser = 0, etapa = (etapa + 1) WHERE idproyecto = (SELECT idproyecto FROM postinterno WHERE idpostinterno = ?)",req.params.idpost,function(err,rows){
                        if(err) console.log("Error Updating : %s ",err);
                        connection.query("UPDATE postinterno SET tipo = 5 WHERE idproyecto = (SELECT idproyecto FROM postinterno WHERE idpostinterno = ?) AND tipo = 0",req.params.idpost,function(err,rows){
                            if(err) console.log("Error Updating : %s ",err);
                            connection.query("SELECT * FROM postinterno WHERE idpostinterno = ?",req.params.idpost,function(err,rows){
                                if(err) console.log("Error SELECTING : %s ",err);
								if(rows.length){
                                    var newuser_act = {
                                        iduser: rows[0].iduser,
                                        idproyecto: rows[0].idproyecto,
                                        tipo : 5,
                                        principal : "El proyecto avanzó de etapa!",
                                        contenido: '<h4>' + rows[0].token.split("&&")[0] + '</h4>' + rows[0].texto1 +'<hr style="border-top-color: black; margin-top: 20px"><h4>' + rows[0].token.split("&&")[1] + '</h4>' + rows[0].texto2,
                                        fecha: new Date()
                                    };
                                    connection.query("INSERT INTO actualizacion SET ?",newuser_act,function (err,rows){
                                        if(err) console.log("Error INSERTING : %s ",err);
                                        res.redirect("/mod_proys");
									});

                                }
							});
						});
					});
				});
			} else if(req.params.resp == "no"){
        		connection.query("UPDATE postinterno SET tipo = 5 WHERE idpostinterno = ?",req.params.idpost,function(err,rows){
                    if(err) console.log("Error Updating : %s ",err);
					res.redirect("/mod_proys");
				});
			} else
				res.redirect("/bad_login");
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');

};
//Vista agregar usuario.
exports.add = function(req, res){
	if(req.session.isAdminLogged){
		res.render('add_user',{page_title:"Agregar usuario", usr:req.session.user});
		}
		else res.redirect('/bad_login');
};
// Logica agregar user.
exports.save = function(req,res){
	if(req.session.isAdminLogged){
		var input = JSON.parse(JSON.stringify(req.body));
		req.getConnection(function (err, connection) {

				var data = {

						username   : input.username,
						password   : input.password,
						tipo	   : input.tipo,
						correo	   : input.correo,
	                    avatar_pat : "/assets/img/placeholder.png"

				};
				var query = connection.query("INSERT INTO user SET ? ",data, function(err, rows)
				{

					if (err)
							console.log("Error inserting : %s ",err );

                    res.redirect('/user');
				});

			 // console.log(query.sql); get raw query

		});
		}
		else res.redirect('/bad_login');
};

//Vista editar usuario.
exports.edit = function(req, res){
	
	if(req.session.isAdminLogged){
		var username = req.params.username;
		
		req.getConnection(function(err,connection){
				var query = connection.query('SELECT * FROM user WHERE username = ?',[username],function(err,rows)
				{
						
						if(err)
								console.log("Error Selecting : %s ",err );
		 
						res.render('edit_user',{page_title:"Edit Users",data:rows, usr:req.session.user});
								
					 
				 });
				 
				 //console.log(query.sql);
		}); 
		}
		else res.redirect('/bad_login');
};

//Logica editar usuario.
exports.save_edit = function(req,res){

	if(req.session.isAdminLogged){
		var input = JSON.parse(JSON.stringify(req.body));
		var username = req.params.username;
		
		req.getConnection(function (err, connection) {
				
				var data = {

						username   : input.username,
						password   : input.password 
				
				};
				
				connection.query("UPDATE user set ? WHERE username = ? ",[data,username], function(err, rows)
				{
	
					if (err)
							console.log("Error Updating : %s ",err );
				 
					res.redirect('/user');
					
				});
		});
		}
		else res.redirect('/bad_login');
};

//Borrar usuario.
exports.delete_user = function(req,res){

	if(req.session.isAdminLogged){
		 var username = req.params.username;
		
		 req.getConnection(function (err, connection) {
				
				connection.query("DELETE FROM user WHERE iduser = ? ",[username], function(err, rows)
				{
						
						 if(err)
								 console.log("Error deleting : %s ",err );
						
						 res.redirect('/user');
						 
				});
				
		 });
		}
		else res.redirect('/bad_login');
};