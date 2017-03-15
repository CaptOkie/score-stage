var express = require('express');
var router = express.Router();
var urls = require('../urls/public');

var temp = [ {
    id : '1',
    title : 'Music Score 1',
    measures : [ {
        timeSig : { upper : 1, lower : 1 },
        bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ],
        modifiers : { end : 'END' }
    } ],
    groups : [ { name : 'Default 1', abbr : 'D1', count : 1 } ]
}, {
    id : '2',
    title : 'Music Score 2',
    measures : [ {
        timeSig : { upper : 1, lower : 1 },
        bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ],
        modifiers : { end : 'END' }
    } ],
    groups : [ { name : 'Default 2', abbr : 'D2', count : 1 } ]
}, {
    id : '3',
    title : 'Music Score 3',
    measures : [ {
        timeSig : { upper : 1, lower : 1 },
        bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ],
        modifiers : { end : 'END' }
    } ],
    groups : [ { name : 'Default 3', abbr : 'D3', count : 1 } ]
}, {
    id : '4',
    title : 'Music Score 4',
    measures : [ {
        timeSig : { upper : 1, lower : 1 },
        bars : [ { clef : 'treble', keySig : 'C', ticks : [] } ],
        modifiers : { end : 'END' }
    } ],
    groups : [ { name : 'Default 4', abbr : 'D4', count : 1 } ]
} ];

router.get(urls.MUSIC_SCORES, function(req, res, next) {
    res.json(temp);
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
