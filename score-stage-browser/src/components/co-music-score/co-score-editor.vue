<template>
    <md-layout md-column md-flex v-co-watch.width="onWidthChanged">
        <canvas @click.prevent="click($event)" @mousemove.prevent="mousemove($event)" @contextmenu.prevent="contextmenu($event)">
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
import coWatch from 'Directives/co-watch';
import constants from './constants';
import { Row, Rows, Position, Canvas } from './types';
import Vex from 'vexflow';
const { StaveNote, Beam, Voice, Accidental, Stave, Renderer } = Vex.Flow;

function getPrev(measure, index) {
    return measure && measure.bars[index];
}

export default {
    name : 'co-score-rows',
    props : [ 'coMeasures', 'coGroups', 'coBarScale' ],
    data() {
        return {
            width : 0, maxWidth : 0, menuX : 0, menuY : 0,
            measure : undefined, canvas : undefined, renderer : undefined
        };
    },
    computed : {
        rows() {
            if (!this.width || !this.maxWidth || !this.coBarScale || !this.coMeasures || !this.coGroups) {
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
                    row = new Row(row ? row.y + row.height : 0);
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
            this.measure = rows[0].measures[0];
            rows.forEach(row => row.setup(this.renderer.getContext(), this.maxWidth, this.coGroups));
            return new Rows(rows);
        }
    },
    methods : {
        onWidthChanged(data) {
            this.width = data.newWidth;
            this.maxWidth = this.width - 1 - constants.xShift;
        },
        click(event) {
            const pos = this.canvas.getPosition(event);
            const row = this.rows.getRow(pos.y);
            this.measure = row.getMeasure(pos.x) || this.measure;
        },
        mousemove(event) {
            const pos = this.canvas.getPosition(event);
            // console.log('Mouse moved', pos);
        },
        contextmenu(event) {
            this.click(event);
            this.menuX = event.clientX;
            this.menuY = event.clientY;
            this.$nextTick(() => {
                this.$refs.menu.open()
            });
        }
    },
    watch : {
        measure(newVal, oldVal) {
            if (this.canvas) {
                if (oldVal) {
                    this.canvas.drawMeasure(oldVal);
                }
                if (newVal) {
                    this.canvas.drawCursor(newVal);
                }
            }
        },
        rows(rows) {
            const row = rows.getLast();
            this.renderer.resize(this.width, row.y + row.height);
            rows.draw();
        }
    },
    mounted() {
        this.canvas = new Canvas(this.$el.firstChild);
        this.renderer = new Renderer(this.canvas.el, Renderer.Backends.CANVAS);
    },
    directives : {
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