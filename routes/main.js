const express = require('express');
const Tweet = require('../models/tweet');
const router = express.Router();

router.get('/', (req, res, next) => {

  if (!req.user) {
    res.render('main/landing');
  } else {
    Tweet.find({}).sort('-created').populate('owner').exec(function (err, tweets) {
      if (err) return next(err);
      res.render('main/home', { tweets: tweets });
    });
  }
});

router.post
module.exports = router;