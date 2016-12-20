var SS = SS || {};

SS.Note = function(letter, octave) {
    this.letter = letter;
    this.octave = octave;
};

SS.Tick = function(duration, notes) {
    this.duration = duration;
    this.notes = notes || [];
};
SS.Tick.prototype.isRest = function() {
    return !this.notes || !this.notes.length;
};

SS.TimeSignature = function(upper, lower, _vexFormat) {
    this.upper = upper;
    this.lower = lower;
    this._vexFormat = _vexFormat || (this.upper + '/' + this.lower);
};
SS.TimeSignature.prototype.vexFormat = function() {
    return this._vexFormat;
};
SS.TimeSignature.C = new SS.TimeSignature(4, 4, 'C');
SS.TimeSignature.C_BAR = new SS.TimeSignature(2, 2, 'C|');

SS.Bar = function(time, keySig, ticks) {
    this.time = time;
    this.keySig = keySig;
    this.ticks = ticks || [];
};
