/**
 * Created by pi on 8/15/16.
 */
// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/um/User');


// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log('serializeUser: ' + user);
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log('deserializeUser id: ' + id);
        User.findOne({
            where:{id: id}
        }).then(function(user) {
            //console.log('deserializeUser: ');
            //console.dir(user);
            done(null, user.getUserWithoutPW());
        });

        // connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
        //     done(err, rows[0]);
        // });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                console.log('local-signup...');
                User.findOne({
                    where:{
                        userName: username
                    }
                }).then(function(user) {
                    console.log('try to check user is existed...');
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                    }
                    var newUserMysql = {
                        userName: username,
                        password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
                        isAdministrator: false, //default
                        isEngineer:false // always false
                    };
                    User.create(newUserMysql).then(function (newUser) {
                        if(!newUser){
                            console.log('create failed');
                        }
                        return done(null, newUser.getUserWithoutPW());
                    });

                });
            })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) { // callback with email and password from our form

                User.findOne({
                    where:{
                        userName: username
                    }
                }).then(function(user) {

                    if (!user) {
                        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                    }
                    console.log('User: ' + user);
                    console.log('User: ' + user.userName);

                    // if the user is found but the password is wrong
                    if (!bcrypt.compareSync(password, user.password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, user.getUserWithoutPW());
                });
            })
    );
};
