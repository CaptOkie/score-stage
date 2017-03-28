const express = require('express');
const router = express.Router();
const Uuid = require('uuid/v4');
const urls = require('../urls/public');
const types = require('../utils/types');
const errors = require('../utils/errors');
const requests = require('../utils/requests');
const MusicScores = require('../db/music-scores');
const musicScores = new MusicScores();

function validString(item) {
    return types.isString(item) && item.length;
}

function getGroupIndex(barIndex, groups) {
    var count = 0;
    for (var i = 0; i < groups.length; ++i) {
        count += groups[i].count;
        if (count > barIndex) {
            return i;
        }
    }
    return undefined;
}

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

    if (!validString(title) || !validString(gName) || !validString(gAbbr)) {
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
                return musicScores.updateScore(id, rev, owner, [ before, measure, after ]).then(done);
            });
        }

        before.next = measure.id;
        return musicScores.updateScore(id, rev, owner, [ before, measure ]).then(done);
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

            return musicScores.updateScore(id, rev, owner, toAdd, [ measure.id ]).then(newRev => {
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

router.post(urls.musicScores.staff(':id'), function(req, res, next) {
    const id = req.params.id;
    const rev = req.body.rev;
    const owner = req.user.id;
    const data = req.body.data;

    musicScores.getGroups(id, rev, owner).then(groups => {
        if (!groups.length) {
            return next(errors.conflict());
        }
        if (data.index > groups.length) {
            return next(errors.conflict());
        }

        if (data.index === groups.length) {
            if (!validString(data.name) || !validString(data.abbr)) {
                return next(errors.badRequest());
            }
            groups.push({ name : data.name, abbr : data.abbr, count : 1 });
        }
        else {
            groups[data.index].count++;
        }

        var index = 0;
        for (var i = 0; i <= data.index; ++i) {
            index += groups[i].count;
        }

        return musicScores.getMeasures(id, rev, owner).then(measures => {
            if (!measures.length) {
                return next(errors.conflict());
            }

            for (var measure of measures) {
                const bar = { clef : 'treble', keySig : 'C', ticks : [] };
                if (index < measure.bars.length) {
                    measure.bars.splice(index, 0, bar);
                }
                else {
                    measure.bars.push(bar);
                }
            }

            return musicScores.updateScore(id, rev, owner, measures, [], groups).then(newRev => {
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

router.delete(urls.musicScores.staff(':id'), function(req, res, next) {
    const id = req.params.id;
    const rev = req.query.rev;
    const owner = req.user.id;
    const barIndex = req.query.index;

    musicScores.getGroups(id, rev, owner).then(groups => {
        if (!groups.length) {
            return next(errors.conflict());
        }
        if (groups.length < 2 && groups[0].count < 2) {
            return next(errors.badRequest());
        }

        const groupIndex = getGroupIndex(barIndex, groups);
        if (groupIndex === undefined) {
            return next(errors.badRequest());
        }
        const group = groups[groupIndex];
        group.count--;
        if (!group.count) {
            groups.splice(groupIndex, 1);
        }

        return musicScores.getMeasures(id, rev, owner).then(measures => {
            if (!measures.length) {
                return next(errors.conflict());
            }

            for (var measure of measures) {
                measure.bars.splice(barIndex, 1);
            }

            return musicScores.updateScore(id, rev, owner, measures, [], groups).then(newRev => {
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

router.post(urls.musicScores.timeSig(':id'), function(req, res, next) {
    const id = req.params.id;
    const rev = req.body.rev;
    const owner = req.user.id;
    const data = req.body.data;

    musicScores.getMeasure(id, rev, owner, data.id).then(measure => {
        if (!measure) {
            return next(errors.conflict());
        }

        measure.timeSig = data.timeSig;
        return musicScores.updateScore(id, rev, owner, [ measure ]).then(newRev => {
            if (!newRev) {
                return next(errors.conflict());
            }
            res.json({ rev : newRev });
        });
    }).catch(error => {
        next(error || errors.internalServerError());
    });
});

router.post(urls.musicScores.keySig(':id'), function(req, res, next) {
    const id = req.params.id;
    const rev = req.body.rev;
    const owner = req.user.id;
    const data = req.body.data;
    if (data.index < 0) {
        return next(errors.badRequest());
    }

    musicScores.getMeasure(id, rev, owner, data.id).then(measure => {
        if (!measure) {
            return next(errors.conflict());
        }
        if (data.index >= measure.bars.length) {
            return next(errors.badRequest());
        }

        measure.bars[data.index].keySig = data.keySig;
        return musicScores.updateScore(id, rev, owner, [ measure ]).then(newRev => {
            if (!newRev) {
                return next(errors.conflict());
            }
            res.json({ rev : newRev });
        });
    }).catch(error => {
        next(error || errors.internalServerError());
    });
});

router.post(urls.musicScores.clef(':id'), function(req, res, next) {
    const id = req.params.id;
    const rev = req.body.rev;
    const owner = req.user.id;
    const data = req.body.data;
    if (data.index < 0) {
        return next(errors.badRequest());
    }

    musicScores.getMeasure(id, rev, owner, data.id).then(measure => {
        if (!measure) {
            return next(errors.conflict());
        }
        if (data.index >= measure.bars.length) {
            return next(errors.badRequest());
        }

        measure.bars[data.index].clef = data.clef;
        return musicScores.updateScore(id, rev, owner, [ measure ]).then(newRev => {
            if (!newRev) {
                return next(errors.conflict());
            }
            res.json({ rev : newRev });
        });
    }).catch(error => {
        next(error || errors.internalServerError());
    });
});

module.exports = router;
