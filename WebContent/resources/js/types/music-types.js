var SS = SS || {};

SS.Note = function(letter, octave, accidental) {
    this.letter = letter;
    this.octave = octave;
    this.accidental = accidental;
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

SS.Bar = function(timeSig, keySig, ticks, modifiers) {
    this.timeSig = timeSig;
    this.keySig = keySig;
    this.ticks = ticks || [];
    this.modifiers = modifiers || {};
};
SS.Bar.getBegin = function(type) {
    switch (type) {
        case 'REPEAT': return Vex.Flow.Barline.type.REPEAT_BEGIN;
        default:       return undefined;
    }
};
SS.Bar.getBeginLarge = function(type) {
    switch (type) {
        case 'REPEAT': return Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT;
        default:       return Vex.Flow.StaveConnector.type.SINGLE_LEFT;
    }
};
SS.Bar.getEnd = function(type) {
    switch (type) {
        case 'REPEAT': return Vex.Flow.Barline.type.REPEAT_END;
        case 'END':    return Vex.Flow.Barline.type.END;
        default:       return undefined;
    }
};
SS.Bar.getEndLarge = function(type) {
    switch (type) {
        case 'REPEAT':
        case 'END':    return Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT;
        default:       return Vex.Flow.StaveConnector.type.SINGLE_RIGHT;
    }
};
SS.Staff = function(clef, bars) {
    this.clef = clef;
    this.bars = bars;
};