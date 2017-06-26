/**
 * Created by benja on 26-06-2017.
 */
exports.create = function(req, res){

    req.getConnection(function(err,connection){

        connection.query('SELECT * FROM post WHERE estado = 2 ORDER BY fecha DESC LIMIT 6',function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );

            res.render('cdd_index',{data:rows,usr:req.session.user});

            //console.log(query.sql);
        });
    });
};
exports.indx = function(req, res){

    req.getConnection(function(err,connection){

        connection.query('SELECT * FROM post WHERE estado = 2 ORDER BY fecha DESC LIMIT 6',function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );

            res.render('cdd_index',{data:rows,usr:req.session.user});

            //console.log(query.sql);
        });
    });
};