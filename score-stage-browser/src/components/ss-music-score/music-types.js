import Vex from 'vexflow';
const { Barline, StaveConnector } = Vex.Flow;

class Note {
    constructor(letter, octave, accidental) {
        this.letter = letter;
        this.octave = octave;
        this.accidental = accidental;
    }
}

class Tick {
    constructor(duration, notes = []) {
        this.duration = duration;
        this.notes = notes;
    }

    isRest() {
        return !this.notes.length;
    }
}

class TimeSignature {
    constructor(upper, lower, vexFormat = upper + '/' + lower) {
        this.upper = upper;
        this.lower = lower;
        this.vexFormat = vexFormat;
    }
}
TimeSignature.C = new TimeSignature(4, 4, 'C');
TimeSignature.C_BAR = new TimeSignature(2, 2, 'C|');

class Bar {
    constructor(clef, keySig, ticks = []) {
        this.clef = clef;
        this.keySig = keySig;
        this.ticks = ticks;
    }
}

class Measure {
    constructor(timeSig, bars, modifiers = {}) {
        this.timeSig = timeSig;
        this.bars = bars;
        this.modifiers = modifiers;
        
        this.reset();
    }

    reset() {
        this.x = 0;
        this.width = 0;
        this.padding = { left : 0, right : 0 };
        this.staves = [];
        this.formatter = undefined;
        this.voices = [];
        this.beams = [];
    }

    widthNoPadding() {
        return this.width - this.totalPadding();
    }

    totalPadding() {
        return this.padding.left + this.padding.right;
    }

    vexBegin() {
        switch (this.modifiers.begin) {
            case 'REPEAT': return Barline.type.REPEAT_BEGIN;
            default:       return undefined;
        }
    }

    vexEnd() {
        switch (this.modifiers.end) {
            case 'REPEAT': return Barline.type.REPEAT_END;
            case 'END':    return Barline.type.END;
            default:       return undefined;
        }
    }
    
    vexBeginLarge() {
        switch (this.modifiers.begin) {
            case 'REPEAT': return StaveConnector.type.BOLD_DOUBLE_LEFT;
            default:       return undefined;
        }
    }

    vexEndLarge() {
        switch (this.modifiers.end) {
            case 'REPEAT': // Fall through
            case 'END':    return StaveConnector.type.BOLD_DOUBLE_RIGHT;
            default:       return StaveConnector.type.SINGLE_RIGHT;
        }
    }

    addStave(stave) {
        this.staves.push(stave);
        this.updatePadding(this.staves.length - 1);
    }

    updatePadding(index) {
        this.width -= this.totalPadding();
        var stave = this.staves[index];
        this.padding.left = Math.max(this.padding.left, stave.getNoteStartX() - stave.getX());
        this.padding.right = Math.max(this.padding.right, stave.getWidth() - (stave.getNoteEndX() - stave.getX()));
        this.width += this.totalPadding();
    }

    joinVoices(minWidth, barScale) {
        var formatter = this.formatter = new Vex.Flow.Formatter();
        this.voices.forEach(function(voice) {
            formatter.joinVoices([ voice ]);
        });
        this.width += (Math.max(this.formatter.preCalculateMinTotalWidth(this.voices) || minWidth, minWidth) * barScale);
    }
}

class Group {
    constructor(name, abbr, count) {
        this.name = name;
        this.abbr = abbr;
        this.count = count;
        this.visible = true;
    }
}

export default {
    Note,
    Tick,
    TimeSignature,
    Bar,
    Measure,
    Group
}