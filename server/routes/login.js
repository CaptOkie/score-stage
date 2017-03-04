var express = require('express');
var router = express.Router();
var urls = require('../urls/public');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        if (username === 'test' && password === 'test') {
            return done(null, { username : 'test' });
        }
        return done(null, false, { message : 'Incorrect username or password' });
    }
));

router.all(urls.LOGIN, function(req, res, next) {
    if (req.user) {
        res.redirect(urls.INDEX);
        return;
    }
    next();
});

router.get(urls.LOGIN, function(req, res, next) {
    res.render('login');
});

router.post(urls.LOGIN,
    passport.authenticate('local', { failureRedirect : urls.LOGIN }),
    function(req, res, next) {
        // Prevent session fixation
        var data = req.session.passport;
        req.session.regenerate(function(err) {
            if (err) {
                next(err);
                return;
            }
            req.session.passport = data;
            req.session.save(function(err) {
                if (err) {
                    next(err);
                    return;
                }
                res.redirect(urls.INDEX);
            });
        });
    });

router.all('*', function(req, res, next) {
    if (!req.user) {
        res.redirect(urls.LOGIN);
        return;
    }
    next();
});

module.exports = router;