const express = require('express');
const router = express.Router();
const urls = require('../urls/public');
const types = require('../utils/types');
const errors = require('../utils/errors');
const requests = require('../utils/requests');
const MusicScores = require('../db/music-scores');
const musicScores = new MusicScores();

router.get(urls.MUSIC_SCORES, function(req, res, next) {

    musicScores.getAllOwnedBy(req.user.id).then(scores => {
        res.json(scores);
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

    musicScores.create({
        owner : req.user.id,
        title : title,
        measures : [ {
            timeSig : { upper : 4, lower : 4 },
            bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ]
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

    musicScores.get(req.params.id).then(score => {
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

router.delete(urls.MUSIC_SCORES + '/:id', function(req, res, next) {
    musicScores.delete(req.params.id, req.user.id).then(count => {
        if (count) {
            return res.json({ success : true });
        }
        next(errors.notFound());
    }, error => {
        next(error || errors.internalServerError());
    });
});

module.exports = router;
