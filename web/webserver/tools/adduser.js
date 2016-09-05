#!/usr/bin/nodejs
var db      = require ('../db');
var Users   = require ('../models/users');
var bcrypt  = require ('bcrypt');
var prompt  = require ('prompt');
var asyncx   = require ('async');
var _       = require ('underscore');


function addUser(username, password) {
    
    var newUser = {username: username}
    
    asyncx.waterfall ([
        _.partial (bcrypt.genSalt, 10),
        
        function (salt, cb) {
            newUser.salt = salt;
            bcrypt.hash (password, salt, cb)
        },
        
        function (crypted, cb) {
            newUser.passwordhash = crypted;
            var u = new Users (newUser);
            u.save (cb); 
        },
        
        function (a, b, cb) {
            console.log("new user", username, "successfully added");
            cb();
        }
     ], function (err, res) {
         if (err) {
             console.log(err)
         } 
         exit();
     });
}




function exit() {
    prompt.stop();
    db.disconnect();
}



function main () {
    prompt.start() ;
    
    prompt.message = ">>>"
        
    var schema = {
        properties: {
          username: {
            pattern: /^[a-zA-Z\s\-]+$/,
            message: 'Name must be only letters, spaces, or dashes',
            required: true
          },
          password: {
            hidden: true
          }
        }
      };
     
    
    prompt.get (schema, function (err, result) {
       addUser(result.username, result.password);
    });
}


db.jsspyDbStatus.on('ready', main) ;

