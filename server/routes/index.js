const authentication = require('./authentication');
const home = require('./home');
const musicScores = require('./music-scores');

// Login should be first
module.exports = [ authentication, home, musicScores ];