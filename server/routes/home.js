const express = require('express');
const router = express.Router();
const urls = require('../urls/public');

router.get([ urls.index(), urls.home() ], function(req, res, next) {
    const data = { username : (req.user && req.user.username) || false };
    res.render(req.user ? 'home' : 'register', data);
});

module.exports = router;
