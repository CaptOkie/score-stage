import {
    alto, baritoneC, baritoneF, bass, frenchViolin, mezzoSoprano, soprano, subbass, tenor, treble, percussion
} from './imgs/clefs';

import {
    cMajor, fMajor, bFlatMajor, eFlatMajor, aFlatMajor, dFlatMajor, gFlatMajor, cFlatMajor,
    gMajor, dMajor, aMajor, eMajor, bMajor, fSharpMajor, cSharpMajor
} from './imgs/key-signatures';

import notes from './imgs/notes';
import rests from './imgs/rests';

const NUM_EXTRA_LINES = 3;
const X_SHIFT = 75;
const MIN_WIDTH = 100;

const CLEFS = [
    { key : 'percussion',    label : percussion   },
    { key : 'french',        label : frenchViolin },
    { key : 'soprano',       label : soprano      },
    { key : 'alto',          label : alto         },
    { key : 'baritone-c',    label : baritoneC    },
    { key : 'bass',          label : bass         },
    { key : 'treble',        label : treble       },
    { key : 'mezzo-soprano', label : mezzoSoprano },
    { key : 'tenor',         label : tenor        },
    { key : 'baritone-f',    label : baritoneF    },
    { key : 'subbass',       label : subbass      },
];

const KEY_SIGNATURES = [
    { key : 'C',  label : cMajor      },
    { key : 'F',  label : fMajor      },
    { key : 'Bb', label : bFlatMajor  },
    { key : 'Eb', label : eFlatMajor  },
    { key : 'Ab', label : aFlatMajor  },
    { key : 'Db', label : dFlatMajor  },
    { key : 'Gb', label : gFlatMajor  },
    { key : 'Cb', label : cFlatMajor  },
    { key : 'G',  label : gMajor      },
    { key : 'D',  label : dMajor      },
    { key : 'A',  label : aMajor      },
    { key : 'E',  label : eMajor      },
    { key : 'B',  label : bMajor      },
    { key : 'F#', label : fSharpMajor },
    { key : 'C#', label : cSharpMajor }
];

const NOTES = Object.keys(notes).map(key => { return { value : key, label : notes[key] }; });
const RESTS = Object.keys(rests).map(key => { return { value : key, label : rests[key] }; });

export {
    NUM_EXTRA_LINES,
	X_SHIFT,
    MIN_WIDTH,
    CLEFS,
    KEY_SIGNATURES,
    NOTES,
    RESTS
}