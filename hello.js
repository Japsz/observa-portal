var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var users = require('./routes/users');
var observ = require('./routes/observatorio');
var event = require('./routes/eventos');
var cdd = require('./routes/ciudadano');
var monitor = require('./routes/monitor');
var posts = require('./routes/posts');
var intern = require('./routes/intern');
var proyect = require('./routes/proyectos');
var admin = require('./routes/admin');
var app = express(), mailer = require("express-mailer");
var flash = require('connect-flash');

var connection  = require('express-myconnection');
var mysql = require('mysql');

mailer.extend(app, {
    from: 'no-reply@example.com',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: 'observaciudadania17@gmail.com',
        pass: 'proyectaobserva'
    }
});
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.methodOverride());
app.use(flash());
app.use(express.cookieParser('isLogged'));
app.use(express.cookieParser('laiks'));

app.use(express.cookieSession());

app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(

    connection(mysql,{

        host: '127.0.0.1',
        user: 'root',
        password : 'observaproyecta',
        port : 3306,
        database:'Observapp'

    },'pool')

);



app.get('/', routes.index);

//Observatorios e Instituciones

app.get('/instit', observ.list);
app.post('/instit_edit', observ.inst_edit);
app.get('/add_inst', observ.add_inst);
app.post('/inst/add', observ.save);
app.get('/obs/:id', observ.obs_list);
app.get('/show_obs/:idobs', observ.admin_obs);
app.post('/obs/add', observ.obs_save);
app.post("/csv_cdd",admin.g_csv_cdd);
app.post("/csv_proy",admin.g_csv_proy);
// Eventos

app.get('/event', event.list);
app.get('/add_event', event.add_evnt);
app.post('/evnt/add', event.save);
app.get('/evnt/:id', event.obs_list);
app.post('/obs_stream', event.obstream);
app.post('/addto_evnt', event.addto_evnt);

// Monitor y Moderador

app.get('/obs_monit', monitor.obs_monit);
app.get('/obs_usr/:idobs', monitor.get_obs);
app.post('/add_cdd', monitor.save_cdd);
app.post('/drop_cdd', monitor.drop_cdd);
app.post('/approve', monitor.approve_p);
app.post('/rmm', monitor.remove_p);
app.get('/app_post/:idobs', monitor.get_prepost);
app.get('/mod_indx', monitor.get_modpost);
app.post('/rmm_comm', monitor.del_comment);
app.post('/approve_comm', monitor.approve_comment);


//Ciudadano

app.post('/m_post', cdd.m_post);
app.post('/cdd/edit', cdd.save_edit);
app.get('/cdd_edit',cdd.edit);
app.get('/cdd_cedit',cdd.commitedit);
app.get('/f_login',cdd.edit_f);
app.post('/cdd/edit_f', cdd.save_edit_f);
app.post('/comment/add_s', cdd.save_comment_single);
app.post('/comment/add', cdd.save_comment);
app.post('/check_usr',cdd.check_usr);

//Posts

app.get('/indx', posts.indx);
app.post('/b_fecha', posts.b_fecha);
app.get('/post/:idpost', posts.getpost);
app.post('/post/add', posts.save);
app.post('/pstcomment_stream',posts.getcomments);
app.post('/post_stream', posts.indx_stream);
app.get('/delete_pst/:idpost', posts.rm_post);
app.post('/tags/bsq',posts.b_tag);
app.get('/tagbsq/:id',posts.get_cat);
app.post('/send_laik',cdd.add_laik);
app.get('/usr_post',posts.usr_post);
app.get('/post_obs',posts.post_obs);
app.post('/post/edit/:idpost', posts.p_edit);

// Proyectos

app.get('/lab',proyect.indx);
app.post('/proy_stream', proyect.proy_stream);
app.post('/render_proyinfo', proyect.render_proyinfo);
app.get('/mod_proys',admin.modproy);
app.post('/mod',admin.moderate_p);
app.post('/laik_p',cdd.add_p_laik);
app.post('/proy/add',proyect.save);
app.get('/proy_cdd',proyect.myproy);
app.get('/proy/get/:idproy',proyect.getproy);
app.post('/act/add',proyect.act_save);
app.post('/sol/add',proyect.sol_save);
app.get('/sol/get/:idproy',proyect.getsol);

// Muro interno proyectos

app.post('/postsol',intern.post_sol);
app.post('/progress',intern.progress);
app.post('/comment_stream',intern.getcomments);
app.post('/intcomment/add', intern.save_comment);
app.get('/intern/:idproy',intern.getproy);
app.post('/intern/add',intern.intern_save);
app.post('/laik_intern',cdd.intern_laik);

//Users

app.get('/user', admin.list);
app.get('/user/add', admin.add);
app.post('/user/add', admin.save);
app.get('/user/delete/:username', admin.delete_user);
app.get('/user/edit/:username', admin.edit);
app.post('/user/edit/:username',admin.save_edit);
app.post('/monit_stream', users.get_monit);
app.get('/admin_logout', users.admin_logout);
app.get('/user_logout', users.user_logout);
app.get('/user_login', users.user_login);
app.get('/admin_login', users.admin_login);
app.get('/bad_login', users.bad_login);
app.post('/admin_login_handler', users.admin_login_handler);
app.post('/user_login_handler', users.user_login_handler);

// file ajax

app.post('/subir_pic', function (req,res) {
    var formidable = require('formidable');
    var fs = require('fs');
    var f_gen = new Date().toLocaleString();
    f_gen = f_gen.replace(/\s/g,'');
    f_gen = f_gen.replace(/\:/g,'');
    f_gen = f_gen.replace(/\//g,'');
    f_gen = f_gen.replace(/\,/g,'');
    f_gen = f_gen + req.session.user.iduser.toString() + ".jpg";
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(err) console.log("error file: %s",err);
        var oldpath = files.filetoupload.path;
        var newpath = '/home/proyecta/observa-portal/public/web-img/' + f_gen;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            console.log('File uploaded and moved!');
            res.send("/web-img/" + f_gen);
        });

    });
});


app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('The game starts on port ' + app.get('port'));
});
