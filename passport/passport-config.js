var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
var User = require('../models/C_permission/user');


passport.use('local',new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback: true
}, (req, username, password, done) => {
        User.findOne({ email: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.comparePassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});