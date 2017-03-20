const express = require('express');
const router = express.Router();
const urls = require('../urls/public');

router.get([ urls.INDEX, urls.HOME ], function(req, res, next) {
    res.render('home');
});

module.exports = router;
