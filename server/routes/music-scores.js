const express = require('express');
const router = express.Router();
const urls = require('../urls/public');
const scores = require('../db/music-scores');
const types = require('../utils/types');
const errors = require('../utils/errors');
const requests = require('../utils/requests');

router.get(urls.MUSIC_SCORES, function(req, res, next) {

    scores.ownedBy(req.user.id).then(results => {
        res.json(results);
    }, error => {
        next(error || errors.internalServerError());
    });
});

router.post(urls.MUSIC_SCORES, function(req, res, next) {

    const title = req.body.title;
    const gName = req.body.gName;
    const gAbbr = req.body.gAbbr;
    function valid(item) {
        return types.isString(item) && item.length;
    }

    if (!valid(title) || !valid(gName) || !valid(gAbbr)) {
        return next(errors.badRequest());
    }

    scores.create({
        owner : req.user.id,
        title : title,
        measures : [ {
            timeSig : { upper : 4, lower : 4 },
            bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ],
            modifiers : { end : 'END' }
        } ],
        groups : [ { name : gName, abbr : gAbbr, count : 1 } ]
    })
    .then(score => {
        res.redirect(urls.MUSIC_SCORES + '/' + score.id);
    }, error => {
        next(error || errors.internalServerError());
    });
});

router.get(urls.MUSIC_SCORES + '/:id', function(req, res, next) {
    if (requests.isHtml(req)) {
        return next();
    }

    const id = req.params.id;
    scores.get(req.params.id).then(score => {
        if (score) {
            return res.json(score);
        }
        next(errors.notFound());
    }, error => {
        next(error || errors.internalServerError());
    });
}, function(req, res, next) {
    res.render('music-score');
});

module.exports = router;
