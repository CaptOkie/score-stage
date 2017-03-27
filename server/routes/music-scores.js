const express = require('express');
const router = express.Router();
const Uuid = require('uuid/v4');
const urls = require('../urls/public');
const types = require('../utils/types');
const errors = require('../utils/errors');
const requests = require('../utils/requests');
const MusicScores = require('../db/music-scores');
const musicScores = new MusicScores();

router.get(urls.musicScores(), function(req, res, next) {

    musicScores.getAllOwnedBy(req.user.id).then(scores => {
        res.json(scores);
    }, error => {
        next(error || errors.internalServerError());
    });
});

router.post(urls.musicScores(), function(req, res, next) {

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
            id : Uuid(),
            timeSig : { upper : 4, lower : 4 },
            bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ]
        } ],
        groups : [ { name : gName, abbr : gAbbr, count : 1 } ]
    })
    .then(sid => {
        res.redirect(urls.musicScores(sid));
    }, error => {
        next(error || errors.internalServerError());
    });
});

router.get(urls.musicScores(':id'), function(req, res, next) {
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

router.delete(urls.musicScores(':id'), function(req, res, next) {
    musicScores.delete(req.params.id, req.user.id).then(success => {
        if (success) {
            return res.json({ success : true });
        }
        next(errors.notFound());
    }, error => {
        next(error || errors.internalServerError());
    });
});

router.post(urls.musicScores.measure(':id'), function(req, res, next) {
    const id = req.params.id;
    const rev = req.body.rev;
    const owner = req.user.id;

    musicScores.getMeasure(id, rev, owner, req.body.id).then(before => {
        if (!before) {
            return next(errors.conflict());
        }

        const bars = before.bars.map(bar => {
            return {
                clef : bar.clef,
                keySig : bar.keySig,
                ticks : []
            };
        });
        const measure = {
            id : Uuid(),
            prev : before.id,
            next : null,
            timeSig : before.timeSig,
            bars : bars
        };

        function done(newRev) {
            if (!newRev) {
                return next(errors.conflict());
            }
            res.json({ id : measure.id, rev : newRev });
        }

        if (before.next) {
            return musicScores.getMeasure(id, rev, owner, before.next).then(after => {
                if (!after) {
                    return next(errors.conflict());
                }

                before.next = measure.id;
                measure.next = after.id;
                after.prev = measure.id;
                return musicScores.spliceMeasures(id, rev, owner, [ before, measure, after ], []).then(done);
            });
        }

        before.next = measure.id;
        return musicScores.spliceMeasures(id, rev, owner, [ before, measure ], []).then(done);
    }).catch(error => {
        next(error || errors.internalServerError());
    });
});

router.delete(urls.musicScores.measure(':id'), function(req, res, next) {
    const id = req.params.id;
    const rev = req.query.rev;
    const owner = req.user.id;

    musicScores.getMeasure(id, rev, owner, req.query.id).then(measure => {
        if (!measure) {
            return next(errors.conflict());
        }

        const promises = [];
        var promise = undefined;
        if (measure.prev) {
            promise = musicScores.getMeasure(id, rev, owner, measure.prev).then(before => {
                return { before : before };
            });
            promises.push(promise);
        }
        if (measure.next) {
            promise = musicScores.getMeasure(id, rev, owner, measure.next).then(after => {
                return { after : after };
            });
            promises.push(promise);
        }

        return Promise.all(promises).then(result => {
            var before = undefined;
            var after = undefined;
            for (var entry of result) {
                if (entry.before) {
                    before = entry.before;
                }
                else if (entry.after) {
                    after = entry.after;
                }
                else {
                    return next(errors.conflict());
                }
            }
            if (!before && !after) {
                // TODO, errors if it's the last measure, is this the correct response?
                return next(errors.badRequest());
            }

            const toAdd = [];
            if (before) {
                before.next = measure.next;
                toAdd.push(before);
            }
            if (after) {
                after.prev = measure.prev;
                toAdd.push(after);
            }

            return musicScores.spliceMeasures(id, rev, owner, toAdd, [ measure.id ]).then(newRev => {
                if (!newRev) {
                    return next(errors.conflict());
                }
                res.json({ rev : newRev });
            });
        });
    }).catch(error => {
        next(error || errors.internalServerError());
    });
});

module.exports = router;
