var express = require('express');
var router = express.Router();
var urls = require('../urls/public');

router.get([ urls.INDEX, urls.HOME ], function(req, res, next) {
  res.render('home');
});

router.get(urls.MUSIC_SCORE, function(req, res, next) {
  res.render('music-score');
});

module.exports = router;
