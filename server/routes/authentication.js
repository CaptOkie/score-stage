const express = require('express');
const router = express.Router();
const urls = require('../urls/public');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const errors = require('../utils/errors');
const Users = require('../db/users');
const users = new Users();

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        const user = users.getCredentials(username).then(user => {
            if (user && password === user.password) {
                delete user.password;
                return done(null, user);
            }
            done(null, false, { message : 'Incorrect username or password' });
        }, error => {
            done(error || errors.internalServerError());
        });
    }
));

router.all(urls.login(), function(req, res, next) {
    if (req.user) {
        return res.redirect(urls.index());
    }
    next();
});

router.get(urls.login(), function(req, res, next) {
    res.render('login');
});

router.post(urls.login(),
    passport.authenticate('local', { failureRedirect : urls.login() }),
    function(req, res, next) {
        // Prevent session fixation
        const data = req.session.passport;
        req.session.regenerate(function(err) {
            if (err) {
                return next(err);
            }

            req.session.passport = data;
            req.session.save(function(err) {
                if (err) {
                    return next(err);
                }
                res.redirect(urls.index());
            });
        });
    });

// router.all('*') seems to be more correct than router.use()
router.all('*', function(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect(urls.login());
});

router.post(urls.logout(), function (req, res, next) {
    req.logout();
    res.redirect(urls.login());
});

module.exports = router;