const express = require('express');
const router = express.Router();
const urls = require('../urls/public');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const errors = require('../utils/errors');
const types = require('../utils/types');
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
        users.getCredentials(username).then(user => {
            if (user) {
                var hash = user.password;
                delete user.password;
                bcrypt.compare(password, hash).then(res => {
                    if (res) {
                        return done(null, user);
                    }
                    done(null, false, { message : 'Incorrect username or password' });
                });
            }
            else {
                done(null, false, { message : 'Incorrect username or password' });
            }
        }).catch(error => {
            done(error || errors.internalServerError());
        });
    }
));

router.all([ urls.login(), urls.register() ], function(req, res, next) {
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

router.get(urls.register(), function(req, res, next) {
    res.render('register');
});

router.post(urls.register(), function(req, res, next) {
    function valid(value) {
        return types.isString(value) && value.length;
    }

    if (!valid(req.body.username) || !valid(req.body.password) || !valid(req.body.cPassword)
        || req.body.password !== req.body.cPassword) {
        return res.redirect(urls.register());
    }

    bcrypt.genSalt().then(salt => {

        return bcrypt.hash(req.body.password, salt).then(hash => {

            const user = { username : req.body.username, password : hash };
            return users.create(user).then(id => {
                if (!id) {
                    return res.redirect(urls.register());
                }
                user.id = id;
                delete user.password;

                req.login(user, error => {
                    if (error) {
                        return next(error);
                    }
                    res.redirect(urls.index());
                });
            });
        });
    }).catch(error => {
        next(error || errors.internalServerError());
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