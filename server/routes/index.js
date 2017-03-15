var authentication = require('./authentication');
var home = require('./home');
var musicScores = require('./music-scores');

// Login should be first
module.exports = [ authentication, home, musicScores ];