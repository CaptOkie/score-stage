var express = require('express');
var router = express.Router();
var urls = require('../urls/public');
var typeUtils = require('../utils/type-utils');
var errorUtils = require('../utils/error-utils');

var temp = [];

router.get(urls.MUSIC_SCORES, function(req, res, next) {
    res.json(temp);
});

router.post(urls.MUSIC_SCORES, function(req, res, next) {

    var title = req.body.title;
    var gName = req.body.gName;
    var gAbbr = req.body.gAbbr;
    function valid(item) {
        return typeUtils.isString(item) && item.length;
    }

    if (!valid(title) || !valid(gName) || !valid(gAbbr)) {
        next(errorUtils.badRequest());
    }
    else {
        var id = '' + (temp.length + 1);
        temp.push({
            id : id,
            title : title,
            measures : [ {
                timeSig : { upper : 4, lower : 4 },
                bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ],
                modifiers : { end : 'END' }
            } ],
            groups : [ { name : gName, abbr : gAbbr, count : 1 } ]
        });
        res.redirect(urls.MUSIC_SCORES + '/' + id);
    }
});

router.get(urls.MUSIC_SCORES + '/:id', function(req, res, next) {
    if (req.accepts([ 'html', 'json' ]) === 'json') {
        var id = req.params.id;
        var items = temp.filter(function(item) { return item.id === id });
        if (items.length) {
            res.json(items[0])
        }
        else {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        }
    }
    else {
        next();
    }
}, function(req, res, next) {
    res.render('music-score');
});

module.exports = router;
