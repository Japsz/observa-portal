exports.indx = function(req, res){

    req.getConnection(function(err,connection){

        connection.query('SELECT * FROM post ORDER BY fecha DESC LIMIT 6',function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );

            res.render('cdd_index',{data:rows,usr:req.session.user});

        //console.log(query.sql);
        });
    });
};
// Logica agregar post.
exports.save = function(req,res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function (err, connection) {

            var data = {

                tipo   : 1,
                iduser   : req.session.user.iduser,

            };

            var query = connection.query("INSERT INTO post SET ? ",data, function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );

                res.redirect('/indx');

            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};