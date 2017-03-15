var express = require('express');
var router = express.Router();
var urls = require('../urls/public');

router.get([ urls.INDEX, urls.HOME ], function(req, res, next) {
    res.render('home');
});

module.exports = router;
