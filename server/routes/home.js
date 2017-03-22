const express = require('express');
const router = express.Router();
const urls = require('../urls/public');

router.get([ urls.index(), urls.home() ], function(req, res, next) {
    res.render('home');
});

module.exports = router;
