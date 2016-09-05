var passport       = require('passport')
var LocalStrategy  = require('passport-localapikey').Strategy;
var BasicStrategy  = require('passport-http').BasicStrategy;
var bcrypt         = require('bcrypt');
var logger         = require('./logger');


var Users = require ('./models/users');

passport.use(new LocalStrategy (function (apikey, done) {
  if (apikey = "supersecret") {
    done(null, true)
  } else {
    done(null, false);
  }
}));



function checkPassword (username, guess, callback) {
    Users.findOne({username:username}).exec ( function (err, user) {
        if (err) {
            logger.debug (err);
            callback (null, false);
        } else {
            if (user == null) {
                logger.debug("no such user", username);
                callback(null, false)
            } else {
                bcrypt.compare (guess, user.passwordhash, function (err, res) {
                    if (err) {
                        logger.debug(err);
                        callback(null, false);
                    } else {
                        if (res){
                            logger.debug("successful password for", username);
                            callback (null, username);
                        }
                        else {
                            logger.debug("invalid password for", username);
                            callback (null, false);
                        }
                    }
                })
            }
        }
    })
}


passport.use(new BasicStrategy( checkPassword ));


module.exports = passport

