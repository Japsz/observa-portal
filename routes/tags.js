/**
 * Created by benja on 26-06-2017.
 */
exports.b_tag = function(req, res){

    req.getConnection(function(err,connection){
        var input = JSON.parse(JSON.stringify(req.body));
        input.busqueda = input.busqueda.replace(/\s/g,'').split(",")
        connection.query('SELECT post.*,GROUP_CONCAT(tags.tag ORDER BY tags.tag) AS tags FROM post LEFT JOIN tagpost ON post.idpost = tagpost.idpost LEFT JOIN tags ON tagpost.idtag = tags.idtag WHERE tags.tag = ? GROUP BY post.idpost ORDER BY post.fecha DESC LIMIT 6',input.busqueda,function(err,rows)
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