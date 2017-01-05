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

SS.TimeSignature = function(upper, lower, vexFormat) {
    this.upper = upper;
    this.lower = lower;
    this.vexFormat = vexFormat || (this.upper + '/' + this.lower);
};
SS.TimeSignature.C = new SS.TimeSignature(4, 4, 'C');
SS.TimeSignature.C_BAR = new SS.TimeSignature(2, 2, 'C|');

SS.Bar = function(clef, keySig, ticks) {
    this.clef = clef;
    this.keySig = keySig;
    this.ticks = ticks || [];
};

SS.Measure = function(timeSig, bars, modifiers) {
    this.timeSig = timeSig;
    this.bars = bars;
    this.modifiers = modifiers || {};
    
    this.reset();
};
SS.Measure.prototype.reset = function() {
    this.x = 0;
    this.width = 0;
    this.padding = { left : 0, right : 0 };
    this.staves = [];
    this.formatter = undefined;
    this.voices = [];
    this.beams = [];
};
SS.Measure.prototype.widthNoPadding = function() {
    return this.width - this.totalPadding();
};
SS.Measure.prototype.totalPadding = function() {
    return this.padding.left + this.padding.right;
};
SS.Measure.prototype.vexBegin = function() {
    switch (this.modifiers.begin) {
        case 'REPEAT': return Vex.Flow.Barline.type.REPEAT_BEGIN;
        default:       return undefined;
    }
};
SS.Measure.prototype.vexBeginLarge = function() {
    switch (this.modifiers.begin) {
        case 'REPEAT': return Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT;
        default:       return Vex.Flow.StaveConnector.type.SINGLE_LEFT;
    }
};
SS.Measure.prototype.vexEnd = function() {
    switch (this.modifiers.end) {
        case 'REPEAT': return Vex.Flow.Barline.type.REPEAT_END;
        case 'END':    return Vex.Flow.Barline.type.END;
        default:       return undefined;
    }
};
SS.Measure.prototype.vexEndLarge = function() {
    switch (this.modifiers.end) {
        case 'REPEAT':
        case 'END':    return Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT;
        default:       return Vex.Flow.StaveConnector.type.SINGLE_RIGHT;
    }
};
SS.Measure.prototype.addStave = function(stave) {
    this.staves.push(stave);
    this.updatePadding(this.staves.length - 1);
};
SS.Measure.prototype.updatePadding = function(index) {
    this.width -= this.totalPadding();
    var stave = this.staves[index];
    this.padding.left = Math.max(this.padding.left, stave.getNoteStartX() - stave.getX());
    this.padding.right = Math.max(this.padding.right, stave.getWidth() - (stave.getNoteEndX() - stave.getX()));
    this.width += this.totalPadding();
};
SS.Measure.prototype.joinVoices = function(barScale) {
    var formatter = this.formatter = new Vex.Flow.Formatter();
    this.voices.forEach(function(voice) {
        formatter.joinVoices([ voice ]);
    });
    this.width += (this.formatter.preCalculateMinTotalWidth(this.voices) * barScale);
};

SS.Group = function(name, abbr, count) {
    this.name = name;
    this.abbr = abbr;
    this.count = count;
};
