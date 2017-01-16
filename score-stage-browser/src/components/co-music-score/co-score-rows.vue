<template>
    <md-layout md-column md-flex v-co-watch.width="onWidthChanged">
        <canvas class="_co-score-row-canvas" v-for="(row, index) in rows" :id="'_co-score-row-' + index" v-co-score-row="{ common, row }"
                @click.prevent="click($event, index)" @mousemove.prevent="mousemove($event, index)" @contextmenu.prevent="contextmenu($event, index)">
         </canvas>

        <md-menu ref="menu" style="display: none;" :md-size="5" :md-offset-x="menuX" :md-offset-y="menuY">
            <div md-menu-trigger></div>
            <md-menu-content>
                <md-menu-item>
                    <md-icon>playlist_add</md-icon>
                    <span>Add measures...</span>
                    <span class="md-list-action" style="margin-right: 0;">Ctrl+A</span>
                </md-menu-item>

                <md-menu-item>
                    <md-icon>delete_sweep</md-icon>
                    <span>Delete measure</span>
                    <span class="md-list-action" style="margin-right: 0;">Ctrl+D</span>
                </md-menu-item>
            </md-menu-content>
        </md-menu>
    </md-layout>
</template>

<script>
import 'Proxies/mdLayout';
import 'Proxies/mdIcon';
import 'Proxies/mdMenu';
import coScoreRow from './co-score-row';
import coWatch from 'Directives/co-watch';
import constants from './constants';
import { Row } from './types';
import Vex from 'vexflow';
const { StaveNote, Beam, Voice, Accidental, Stave } = Vex.Flow;

function getPrev(measure, index) {
    return measure && measure.bars[index];
}

export default {
    name : 'co-score-rows',
    props : [ 'coMeasures', 'coGroups', 'coBarScale' ],
    data() {
        return { width : 0, maxWidth : 0, menuX : 0, menuY : 0 };
    },
    computed : {
        common() {
            return { width : this.width, maxWidth : this.maxWidth, barScale : this.coBarScale, groups : this.coGroups };
        },
        rows() {
            if (!this.width || !this.maxWidth || !this.coBarScale || !this.coMeasures) {
                return undefined;
            }

            const rows = [];
            let prevMeasure = undefined;
            this.coMeasures.forEach((measure, mIndex) => {
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
                measure.joinVoices(constants.minWidth, this.coBarScale);
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
        },
        click(event, index) {
            console.log('Clicked row', index);
        },
        mousemove(event, index) {
            console.log('Mouse moved', index);
        },
        contextmenu(event, index) {
            this.menuX = event.clientX;
            this.menuY = event.clientY;
            this.$nextTick(() => { this.$refs.menu.open() });
        }
    },
    directives : {
        coScoreRow,
        coWatch
    }
}
</script>

<style>
    ._co-score-row-canvas {
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        -moz-user-select: none;
    }
</style>