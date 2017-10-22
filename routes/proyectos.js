/**
 * Created by benja on 17-08-2017.
 */
exports.indx = function(req, res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT proyecto.*,user.username,user.avatar_pat as iconouser,GROUP_CONCAT(DISTINCT tags.tag ORDER BY tags.tag) AS tagz,' +
                ' GROUP_CONCAT(DISTINCT proylike.iduser SEPARATOR "&&") as proylaik, COUNT(DISTINCT proylike.iduser) as lenlaik FROM' +
                ' proyecto LEFT JOIN tagproyecto ON proyecto.idproyecto = tagproyecto.idproyecto LEFT JOIN tags ON tagproyecto.idtag = tags.idtag' +
                ' INNER JOIN user ON user.iduser = proyecto.idcreador LEFT JOIN proylike ON proylike.idproyecto = proyecto.idproyecto' +
                ' GROUP BY proyecto.idproyecto ORDER BY proyecto.actualizado DESC LIMIT 12',function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.render('proyect_indx',{data :rows, usr:req.session.user});

                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
exports.proy_stream = function(req,res){
  if(req.session.isUserLogged){
      var input = JSON.parse(JSON.stringify(req.body));
      var htmlobj = {};
      req.getConnection(function(err,connection){

          connection.query('SELECT proyecto.*,user.username,user.avatar_pat as iconouser,GROUP_CONCAT(DISTINCT tags.tag ORDER BY tags.tag) AS tagz,' +
              ' GROUP_CONCAT(DISTINCT proylike.iduser SEPARATOR "&&") as proylaik, COUNT(DISTINCT proylike.iduser) as lenlaik FROM' +
              ' proyecto LEFT JOIN tagproyecto ON proyecto.idproyecto = tagproyecto.idproyecto LEFT JOIN tags ON tagproyecto.idtag = tags.idtag' +
              ' INNER JOIN user ON user.iduser = proyecto.idcreador LEFT JOIN proylike ON proylike.idproyecto = proyecto.idproyecto' +
              ' WHERE proyecto.actualizado < ? GROUP BY proyecto.idproyecto ORDER BY proyecto.actualizado DESC LIMIT 9',[new Date(input.idpost)],function(err,rows)
          {
              if(err)
                  console.log("Error Selecting : %s ",err );
              if(rows.length){
                  var sep = rows.length - rows.length%3;
                  var tot = rows.length;
                  sep = sep/3;
                  if(sep == 0){
                      sep = 1;
                  }
                  res.render('proy_stream',{data:rows.slice(0,sep), usr:req.session.user,sep:"u"},function (err,html) {
                      if(err) console.log("Error rendering: %s",err);
                      htmlobj.uno = html;
                      res.render('proy_stream',{data:rows.slice(sep,2*sep), usr:req.session.user,sep:"d"},function (err,html) {
                          if(err) console.log("Error rendering: %s",err);
                          htmlobj.dos = html;
                          res.render('proy_stream',{data:rows.slice(2*sep,tot), usr:req.session.user,sep:"t"},function (err,html) {
                              if(err) console.log("Error rendering: %s",err);
                              htmlobj.tres = html;
                              res.send({html: htmlobj, newval: rows[rows.length - 1].actualizado});
                          });
                      });
                  });
              } else {
                  res.send({html: "<p>No hay Mas Proyectos</p>", newval: "nada"});
              }


              //console.log(query.sql);
          });
      });
  }
};
exports.myproy = function(req, res){
    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('SELECT proyecto.*,GROUP_CONCAT(DISTINCT tags.tag ORDER BY tags.tag) AS tagz FROM' +
                ' proyecto LEFT JOIN tagproyecto ON proyecto.idproyecto = tagproyecto.idproyecto LEFT JOIN tags ON tagproyecto.idtag = tags.idtag' +
                ' LEFT JOIN userproyecto ON proyecto.idproyecto = userproyecto.idproyecto LEFT JOIN user ON user.iduser = userproyecto.iduser' +
                ' WHERE user.iduser = ? GROUP BY proyecto.idproyecto ORDER BY proyecto.actualizado DESC',req.session.user.iduser,function(err,rows)
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

            connection.query('SELECT solucion.*,user.username,user.avatar_pat as iconouser FROM solucion LEFT JOIN user ON user.iduser = solucion.iduser' +
                ' WHERE solucion.idproyecto = ? GROUP BY solucion.idsolucion ORDER BY solucion.fecha DESC',req.params.idproy,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var acts = rows;
                connection.query('SELECT group_concat(user.username , "@" , user.iduser, "@", user.avatar_pat) as usuarios,proyecto.*,' +
                    'etapa.token FROM proyecto LEFT JOIN userproyecto ON userproyecto.idproyecto = proyecto.idproyecto LEFT JOIN user ON user.iduser = userproyecto.iduser' +
                    ' LEFT JOIN etapa ON etapa.idevento = proyecto.idevento AND etapa.nro = proyecto.etapa WHERE proyecto.idproyecto = ?',req.params.idproy,function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );
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
            var data = {
                idcreador   : req.session.user.iduser,
                titulo : input.tit,
                descripcion: input.testo,
                problema: input.prob,
                media: input.media
            };
            connection.query("SELECT observatorio.idevento FROM observatorio LEFT JOIN ciudadano ON observatorio.idobservatorio = ciudadano.idobs WHERE ciudadano.iduser = ? GROUP BY observatorio.idevento LIMIT 1",req.session.user.iduser,function(err,rows){
               data.idevento = rows[0].idevento;
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
                res.redirect('/sol/get/' + input.idproy);
                //console.log(query.sql);
            });
        });
    } else res.redirect('/bad_login');
};
