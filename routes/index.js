var express = require('express');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect("/index");
});
router.get('/index', function(req, res, next) {
    res.render('index', { load:"content" , error:true});
});
router.get('/login', function(req, res, next) {
    res.render('index', { load:"content" });
});
router.get('/signup', function(req, res, next) {
    res.render('index', { load:"signup" });
});
router.post('/signup', function(req, res, next) {
    req.checkBody('username',"Username cannot be empty").isEmpty();
    req.checkBody('username',"Username must have length between 5-100").isLength(5,100);
    req.checkBody('email',"Invalid email formate").isEmail();
    req.checkBody('pwd',"password must have length between 5-100").isLength(5,100);
    req.checkBody('pwd',"password must include one lowercase character, one uppercase character, a number and a special character")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/,"i");
    req.checkBody('pwd2',"Password do not match").equals(req.body.pwd);
    const error = req.validationErrors();

    const username = req.body.username;
    const email = req.body.email;
    const pwd = req.body.pwd;
    const pwd2 = req.body.pwd2;
    var reqElement = {username , email,pwd,pwd2};
    console.log(error.length);
    if(error){
        res.render('index', { load:"signup",error : error, reqElement :reqElement });
    }else{
        const connection = require('../db');
        connection.query('INSERT INTO `user`( `username`, `email`, `password`) VALUES(?,?,?)',[username,email,pwd], function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results[0].solution);
        });
        res.render('index', { load:"signup" });
    }



});
router.get('/profile', function(req, res, next) {
    res.render('index', { load:"content" });
});

module.exports = router;
