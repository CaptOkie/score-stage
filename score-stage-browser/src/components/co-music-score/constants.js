import { cMajor, fMajor, bFlatMajor, eFlatMajor, aFlatMajor, dFlatMajor, gFlatMajor, cFlatMajor,
    gMajor, dMajor, aMajor, eMajor, bMajor, fSharpMajor, cSharpMajor } from './imgs';

const X_SHIFT = 75;
const MIN_WIDTH = 100;
const CLEFS = [
    { key : 'treble',        label : 'Treble'        },
    { key : 'bass',          label : 'Bass'          },
    { key : 'tenor',         label : 'Tenor'         },
    { key : 'alto',          label : 'Alto'          },
    { key : 'soprano',       label : 'Soprano'       },
    { key : 'percussion',    label : 'Percussion'    },
    { key : 'mezzo-soprano', label : 'Mezzo-soprano' },
    { key : 'baritone-c',    label : 'Baritone C'    },
    { key : 'baritone-f',    label : 'Baritone F'    },
    { key : 'subbass',       label : 'Subbass'       },
    { key : 'french',        label : 'French violin' }
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

export {
	X_SHIFT,
    MIN_WIDTH,
    CLEFS,
    KEY_SIGNATURES
}