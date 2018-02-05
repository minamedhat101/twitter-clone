const express = require('express');
var passport = require('passport');
const async = require('async');

const User = require('../models/user');
const Tweet = require('../models/tweet');
const passportConfig = require('../config/passport');

const router = express.Router();

router.get('/signup', (req, res, next) => {
  res.render('account/signup', { message: req.flash('errors') });
});

router.post('/signup', (req, res, next) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (user) {
      req.flash('errors', 'email already exist');
      res.redirect('signup');
    } else {
      let user = new User();
      user.email = req.body.email;
      user.name = req.body.name;
      user.photo = user.gravatar();
      user.password = req.body.password;
      user.save(function (err) {
        req.logIn(user, function (err) {
          if (err) return next(err);
          res.redirect('/');
        });
      });
    }
  });
});

router.get('/signin', (req, res, next) => {
  if (req.user) redirect('/');
  res.render('account/signin', { message: req.flash('loginMessage') });
});

router.post('/signin', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/account/signin',
  failureFlash: true
}));

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;