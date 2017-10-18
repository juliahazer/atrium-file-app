var express = require("express");
var router = express.Router();
var db = require("../models");
//http://passportjs.org/docs
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function verifyCallback(req, username, password, done) {
    //check User database for matching username/password record
    db.User.findOne({ username: username, password: password}, function (err, user) {
      if (err) return done(err);
      if (!user) {
        //if no matching user, flash error message
        req.flash('message', 'incorrect login!')
        return done(null, false);
      } else {
        //if matching user, return the user record
        return done(null, user);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.findById(id).then(function(user) {
    done(null, user);
  });
});

router.get('/login', function(req,res){
  res.render('login');
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/files/file-upload',
    failureRedirect: '/users/login'
  }));

router.get('/logout', function(req,res){
    req.logout()
    req.flash('message', 'Logged out!')
    res.redirect('/users/login')
})

module.exports = router;
