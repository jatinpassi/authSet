var express = require('express');
var passport = require('passport');
var router = express.Router();

var bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect("/index");
});
router.get('/index',authenticationMiddleware(), function(req, res, next) {
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('index', { load:"content" , error:true});
});
router.get('/login', function(req, res, next) {
    res.render('index', { load:"login" });
});
router.get('/logout', function(req, res, next) {
    req.logOut();
    req.session.destroy();
    res.redirect('/');
});
router.post('/login',passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login'
}));
router.get('/signup', function(req, res, next) {

    res.render('index', { load:"signup" });
});
router.post('/signup', function(req, res, next) {
    req.checkBody('username',"Username must have length between 5-100").isLength(5,100);
    req.checkBody('username',"Username cannot be empty").notEmpty();
    req.checkBody('email',"Invalid email formate").isEmail();
    req.checkBody('pwd',"password must have length between 5-100").isLength(5,100);
    req.checkBody('pwd',"password must include one lowercase character, one uppercase character, a number and a special character")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/,"i");
    req.checkBody('pwd2',"Password do not match, Please re-enter your password").equals(req.body.pwd);
    const error = req.validationErrors();

    const username = req.body.username;
    const email = req.body.email;
    var reqElement = [];
    reqElement.push(username);
    reqElement.push(email);
    if(error){
        var username_err = []
        var email_err = []
        var pwd_err = []
        var pwd2_err = []
        for (var i=0;i<error.length;i++){
            if (error[i].param == 'username'){
                username_err.push(error[i].msg);
            }else if (error[i].param == 'email'){
                email_err.push(error[i].msg);
            }else if (error[i].param == 'pwd'){
                pwd_err.push(error[i].msg);
            }else if (error[i].param == 'pwd2'){
                pwd2_err.push(error[i].msg);
            }
        }
        var main_error = [];
        main_error.push(username_err);
        main_error.push(email_err);
        main_error.push(pwd_err);
        main_error.push(pwd2_err);
        res.render('index', { load:"signup",error : main_error, reqElement :reqElement });
    }else{
        const pwd = req.body.pwd;
        const connection = require('../db');
        bcrypt.hash(pwd, saltRounds, function(err, hash) {
            connection.query('INSERT INTO `user`( `username`, `email`, `password`) VALUES(?,?,?)',[username,email,hash], function (error, results, fields) {
                //if (error) console.log(error);

               connection.query("SELECT LAST_INSERT_ID() as user_id",(error, results, fields)=>{
                     //if (error) res.redirect("/signup");

                   const user_id = results[0];

                    req.login(user_id,function (err) {
                         res.redirect("/");
                     });
                 });
            });
        });
    }
});
router.get('/profile',authenticationMiddleware(), function(req, res, next) {
    res.render('index', { load:"profile" });
});


passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
        done(null, user_id);
});


function authenticationMiddleware(){
    return (req, res, next)=>{
        if (req.isAuthenticated()) return next();
        else res.redirect('/login');
    }
}
module.exports = router;
