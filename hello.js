var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var users = require('./routes/users');
var observ = require('./routes/observatorio');
var cdd = require('./routes/ciudadano');
var admin = require('./routes/admin');
var app = express();
var flash = require('connect-flash');

var connection  = require('express-myconnection');
var mysql = require('mysql');

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
app.get('/add_inst', observ.add_inst);
app.post('/inst/add', observ.save);
app.get('/obs/:id', observ.obs_list);
app.post('/obs/add', observ.obs_save);
//Ciudadano
app.get('/indx', cdd.indx);
app.post('/post/add', cdd.save);
app.post('/m_post', cdd.m_post);

//Users
app.get('/user', admin.list);
app.get('/user/add', admin.add);
app.post('/user/add', admin.save);
app.get('/user/delete/:username', admin.delete_user);
app.get('/user/edit/:username', admin.edit);
app.post('/user/edit/:username',admin.save_edit);
app.get('/user_logout', users.user_logout);
app.get('/admin_logout', users.admin_logout);
app.get('/user_login', users.user_login);
app.get('/admin_login', users.admin_login);
app.get('/bad_login', users.bad_login);
app.post('/admin_login_handler', users.admin_login_handler);
app.post('/user_login_handler', users.user_login_handler);


app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('The game starts on port ' + app.get('port'));
});