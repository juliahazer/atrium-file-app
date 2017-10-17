var express = require("express");
var router = express.Router();
var db = require("../models");
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function verifyCallback(req, username, password, done) {
    db.User.findOne({ username: username, password: password}, function (err, user) {
      if (err) return done(err);
      if (!user) {
        req.flash('message', 'incorrect login!')
        return done(null, false);
      }
      user.comparePassword(password, function(err,isMatch){
        if(isMatch){
            return done(null, user);
        } else {
            req.flash('message', 'incorrect login!')
            return done(null, false);
        }
      })
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
    req.flash('message', 'logged out!')
    res.redirect('/users/login')
})

module.exports = router;
