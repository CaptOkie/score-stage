class NoteLink {

    constructor(letter, adjust = 0) {
        this.letter = letter;
        this.adjust = adjust;
    }

    apply(octave) {
        return { letter : this.letter, octave : octave + this.adjust };
    }
}

const NOTE_INDEX = {
    'a' : { lower : new NoteLink('g'),     higher : new NoteLink('b')    },
    'b' : { lower : new NoteLink('a'),     higher : new NoteLink('c', 1) },
    'c' : { lower : new NoteLink('b', -1), higher : new NoteLink('d')    },
    'd' : { lower : new NoteLink('c'),     higher : new NoteLink('e')    },
    'e' : { lower : new NoteLink('d'),     higher : new NoteLink('f')    },
    'f' : { lower : new NoteLink('e'),     higher : new NoteLink('g')    },
    'g' : { lower : new NoteLink('f'),     higher : new NoteLink('a')    }
};

export function lowerNote(letter, octave) {
    return NOTE_INDEX[letter].lower.apply(octave);
}

export function higherNote(letter, octave) {
    return NOTE_INDEX[letter].higher.apply(octave);
}

class BaseNote {
    constructor(letter, octave) {
        this.letter = letter;
        this.octave = octave;
    }

    apply(line) {
        let start = 0;
        let end = line.num;
        let func = lowerNote;
        if (line.num < 0) {
            start = line.num;
            end = 0;
            func = higherNote;
        }

        let curr = { letter : this.letter, octave : this.octave };
        for (let i = start; i < end; ++i) {
            // Move through the space to the next line
            for (let j = 0; j < 2; ++j) {
                curr = func(curr.letter, curr.octave);
            }
        }
        // Space is always 1 note lower
        if (line.space) {
            return lowerNote(curr.letter, curr.octave);
        }
        return curr;
    }
}

const CLEF_INDEX = {
    'percussion'    : new BaseNote('f', 5),
    'french'        : new BaseNote('a', 5),
    'soprano'       : new BaseNote('d', 5),
    'alto'          : new BaseNote('g', 4),
    'baritone-c'    : new BaseNote('c', 4),
    'bass'          : new BaseNote('a', 3),
    'treble'        : new BaseNote('f', 5),
    'mezzo-soprano' : new BaseNote('b', 4),
    'tenor'         : new BaseNote('e', 4),
    'baritone-f'    : new BaseNote('c', 4),
    'subbass'       : new BaseNote('f', 3)
};

export function getNote(clef, line) {
    return CLEF_INDEX[clef].apply(line);
}