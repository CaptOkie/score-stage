const authentication = require('./authentication');
const home = require('./home');
const musicScores = require('./music-scores');
const search = require('./search');

// Login should be first
module.exports = [ authentication, home, musicScores, search ];