const express = require('express');
var passport = require('passport');
const async = require('async');

const User = require('../models/user');
const Tweet = require('../models/tweet');
const passportConfig = require('../config/passport');

const router = express.Router();

router.get('/:id', (req, res, next) => {
  async.waterfall([
    function (callback) {
      Tweet.find({ owner: req.params.id }).populate('owner')
        .exec(function (err, tweets) {
          callback(err, tweets);
        });
    },
    function (tweets, callback) {
      User.findOne({ _id: req.params.id }).populate('following').populate('followers')
        .exec(function (err, user) {
          let currentUser;
          if (req.user._id.equals(user._id)) {
            currentUser = true;
          } else {
            currentUser = false;
          }
          res.render('user/profile', { foundUser: user, tweets: tweets, currentUser: currentUser });
        });
    }
  ]);
});

router.post('/follow/:id', (req, res, next) => {
  async.parallel([
    function (callback) {
      User.update(
        {
          _id: req.user._id,
          following: { $ne: req.params.id }
        },
        {
          $push: { following: req.params.id }
        }, function (err, count) {
          callback(err, count);
        }
      )
    },

    function (callback) {
      User.update(
        {
          _id: req.params.id,
          followers: { $ne: req.user._id }
        },
        {
          $push: { followers: req.user._id }
        }, function (err, count) {
          callback(err, count);
        }
      )
    }
  ], function (err, results) {
    if (err) return next(err);
    res.json("Success");
  });
});


router.post('/unfollow/:id', (req, res, next) => {
  async.parallel([
    function (callback) {
      User.update(
        {
          _id: req.user._id,
        },
        {
          $pull: { following: req.params.id }
        }, function (err, count) {
          callback(err, count);
        }
      )
    },

    function (callback) {
      User.update(
        {
          _id: req.params.id,
        },
        {
          $pull: { followers: req.user._id }
        }, function (err, count) {
          callback(err, count);
        }
      )
    }
  ], function (err, results) {
    if (err) return next(err);
    res.json("Success");
  });
});


module.exports = router;