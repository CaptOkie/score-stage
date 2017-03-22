const LOGIN = '/login';
const LOGOUT = '/logout';
const INDEX = '/';
const HOME = '/home';
const MUSIC_SCORES = '/music-scores';
const MEASURE = '/measure';
const TIME_SIG = '/time-sig';
const KEY_SIG = '/key-sig';
const CLEF = '/clef';
const TICK = '/tick';

function musicScores(id) {
    return (id && (MUSIC_SCORES + '/' + id)) || MUSIC_SCORES;
}

musicScores.measure = function(id) {
    return musicScores(id) + MEASURE;
};

musicScores.timeSig = function(id) {
    return musicScores(id) + TIME_SIG;
};

musicScores.keySig = function(id) {
    return musicScores(id) + KEY_SIG;
};

musicScores.clef = function(id) {
    return musicScores(id) + CLEF;
};

musicScores.tick = function(id) {
    return musicScores(id) + TICK;
};

module.exports = {
    login : () => LOGIN,
    logout : () => LOGOUT,
    index : () => INDEX,
    home : () => HOME,
    musicScores : musicScores
};