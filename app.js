var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const expressValidator = require("express-validator");
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var index = require('./routes/index');
var MySQLStore = require('express-mysql-session')(session);
var bcrypt = require('bcrypt');

var app = express();

require('dotenv').config({path: ''})

var options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

var sessionStore = new MySQLStore(options);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'mySecreteCode',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req,res,next) {
    res.locals.isAuth = req.isAuthenticated();
    res.locals.isUnAuth = req.isUnauthenticated();
    next();
});
app.use('/', index);

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'pwd'
    },
    function( username, password, done) {
        const connection = require('./db');
        connection.query('SELECT `id`, `password` FROM `user` WHERE `username` = ?',[username], function (error, results, fields) {
            if(error) done(error);

            if(results.length == 0){
                return done(null,false);
            }else {
                var hash = results[0].password.toString();
                var userId = results[0].id;
                bcrypt.compare(password, hash, function (err, res) {
                    if (res) {
                        return done(null, {user_id: userId});
                    } else {
                        return done(null, false);
                    }
                });
            }
        });
    }
));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
