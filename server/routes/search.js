const express = require('express');
const router = express.Router();
const urls = require('../urls/public');
const requests = require('../utils/requests');
const errors = require('../utils/errors');
const MusicScores = require('../db/music-scores');
const musicScores = new MusicScores();

router.get(urls.search(), function(req, res, next) {
    if (requests.isHtml(req)) {
        return next();
    }

    const query = req.query.query;
    if (!query || !query.length) {
        return next(errors.badRequest());
    }

    musicScores.search(query).then(scores => {
        res.json(scores);
    }).catch(error => {
        next(error || errors.internalServerError());
    });
}, function(req, res, next) {
    const data = {
        username : (req.user && req.user.username) || false,
        query : req.query.query || false
    };

    res.render('search', data);
});

module.exports = router;
