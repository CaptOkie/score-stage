<template>
    <md-layout md-column md-flex v-watch.width="onWidthChanged">
        <ss-score-row v-for="row in rows" :row="row" :groups="groups" :view-width="width" :max-width="maxWidth" :bar-scale="barScale"></ss-score-row>
    </md-layout>
</template>

<script>
import Vue from 'vue';
import 'Proxies/mdLayout';
import ssScoreRow from './ss-score-row.vue';
import 'Directives/watch';
import constants from './constants';
import { Row } from './types';
import Vex from 'vexflow';
const { StaveNote, Beam, Voice, Accidental, Stave } = Vex.Flow;

function getPrev(measure, index) {
    return measure && measure.bars[index];
}

export default {
    name : 'ss-score-rows',
    props : [ 'measures', 'groups', 'barScale' ],
    data() {
        return {
            width : 0,
            maxWidth : 0
        };
    },
    computed : {
        rows() {
            if (!this.width || !this.maxWidth || !this.barScale || !this.measures) {
                return;
            }

            const rows = [];
            let prevMeasure = undefined;
            this.measures.forEach((measure, mIndex) => {
                measure.reset();
                measure.bars.forEach((bar, bIndex) => {
                    const prev = getPrev(prevMeasure, bIndex);
                    
                    // ** CREATE VOICE ** //
                    
                    const notes = bar.ticks.map(tick => {
                        let keys = tick.notes.map(note => note.letter + note.accidental + '/' + note.octave);
                        let duration = tick.duration + '';
                        if (tick.isRest()) {
                            keys = [ 'r/4' ];
                            duration += 'r';
                        }
                        return new StaveNote({ clef : bar.clef, keys : keys, duration : duration, auto_stem: true });
                    });
                    // Connect notes
                    Beam.generateBeams(notes).forEach(beam => measure.beams.push(beam));
                    const voice = new Voice({ beat_value : measure.timeSig.upper, num_beats : measure.timeSig.lower }).setStrict(false).addTickables(notes);
                    // Display correct accidentals
                    Accidental.applyAccidentals([ voice ], bar.keySig);
                    measure.voices.push(voice);
                    
                    // ** CREATE STAVE ** //
                    
                    const stave = new Stave(0, 0, this.maxWidth);
                    // Set bar begin
                    let modifier = measure.vexBegin();
                    if (modifier) {
                        stave.setBegBarType(modifier);
                    }
                    // Set bar end
                    modifier = measure.vexEnd();
                    if (modifier) {
                        stave.setEndBarType(modifier);
                    }
                    // Add time signature if necessary
                    if (!prevMeasure || prevMeasure.timeSig.vexFormat !== measure.timeSig.vexFormat) {
                        stave.addTimeSignature(measure.timeSig.vexFormat);
                    }
                    // Add key signature if necessary
                    if (!prev || prev.keySig !== bar.keySig) {
                        stave.setKeySignature(bar.keySig, prev && prev.keySig);
                    }
                    // Add clef
                    stave.clef = bar.clef;
                    if (!prev || prev.clef !== bar.clef) {
                        stave.setClef(bar.clef);
                    }
                    measure.addStave(stave);
                });
                measure.joinVoices(constants.minWidth, this.barScale);
                let row = rows.length && rows[rows.length - 1];
                
                // New Row
                if (!row || (row.width + measure.width) > this.maxWidth) {
                    row = new Row();
                    rows.push(row);
                    measure.bars.forEach((bar, bIndex) => {
                        let prev = getPrev(prevMeasure, bIndex);
                        let cancelKey = prev && prev.keySig !== bar.keySig && prev.keySig;
                        measure.staves[bIndex].setClef(bar.clef).setKeySignature(bar.keySig, cancelKey);
                        measure.updatePadding(bIndex);
                    });
                }
                row.addMeasure(measure);
                prevMeasure = measure;
            });
            return rows;
        }
    },
    methods : {
        onWidthChanged(data) {
            this.width = data.newWidth;
            this.maxWidth = this.width - 1 - constants.xShift;
        }
    },
    components : {
        ssScoreRow
    }
}
</script>