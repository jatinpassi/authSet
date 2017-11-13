var mysql = require('mysql');
require('dotenv').config({path: ''})

var connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME
});

connection.connect();

module.exports  = connection;