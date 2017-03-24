<template>
    <md-layout md-column md-flex v-co-watch.width="onWidthChanged">
        <div class="co-score-context" @click.prevent="click"></div>
    </md-layout>
</template>

<script>
import 'Proxies/mdLayout';
import coWatch from 'Directives/co-watch';
import { X_SHIFT, MIN_WIDTH } from './constants';
import { Row, Rows, Position, SvgEngine, SingleCursor } from './types';
import Vex from 'vexflow';
const { StaveNote, Beam, Voice, Accidental, Stave, Renderer, Barline } = Vex.Flow;

function getPrev(measure, index) {
    return measure && measure.bars[index];
}

export default {
    name : 'co-score-editor',
    props : [ 'coMeasures', 'coGroups', 'coBarScale' ],
    data() {
        return { width : 0, cursor : undefined };
    },
    computed : {
        maxWidth() {
            return this.width - 1 - X_SHIFT;
        },
        rows() {
            if (!this.width || !this.maxWidth || !this.coBarScale || !this.coMeasures || !this.coGroups) {
                return undefined;
            }

            const rows = [];
            this.coMeasures.forEach(measure => {
                measure.reset();
                measure.bars.forEach((bar, bIndex) => {
                    const prev = getPrev(measure.prev, bIndex);
                    
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
                    const voice = new Voice({ beat_value : measure.timeSig.upper, num_beats : measure.timeSig.lower })
                        .setStrict(false).addTickables(notes);
                    // Display correct accidentals
                    Accidental.applyAccidentals([ voice ], bar.keySig);
                    measure.voices.push(voice);
                    
                    // ** CREATE STAVE ** //
                    
                    const stave = new Stave(0, 0, this.maxWidth);
                    // Set bar end
                    if (!measure.next) {
                        stave.setEndBarType(Barline.type.END);
                    }
                    // Add time signature if necessary
                    if (!measure.prev || measure.prev.timeSig.vexFormat !== measure.timeSig.vexFormat) {
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
                measure.joinVoices(MIN_WIDTH, this.coBarScale);
                let row = rows.length && rows[rows.length - 1];
                
                // New Row
                if (!row || (row.width + measure.width) > this.maxWidth) {
                    row = new Row(row ? row.y + row.height : 0);
                    rows.push(row);
                    measure.bars.forEach((bar, bIndex) => {
                        let prev = getPrev(measure.prev, bIndex);
                        let cancelKey = prev && prev.keySig !== bar.keySig && prev.keySig;
                        measure.staves[bIndex].setClef(bar.clef).setKeySignature(bar.keySig, cancelKey);
                        measure.updatePadding(bIndex);
                    });
                }
                row.addMeasure(measure);
            });
            const ret = new Rows(rows);
            this.engine.setup(ret, this.maxWidth, this.coGroups);
            return ret;
        }
    },
    methods : {
        onWidthChanged(data) {
            this.width = data.newWidth;
        },
        click(event) {
            const pos = this.engine.getPosition(event);
            const row = this.rows.getRow(pos.y);
            const measure = row.getMeasure(pos.x);
            if (measure) {
                const newCursor = SingleCursor.fromPosition(measure, pos);
                if (newCursor) {
                    this.cursor = newCursor;
                }
            }
        },
    },
    watch : {
        cursor(cursor) {
            this.engine.drawCursor(cursor);
            this.$emit('cursor-changed', cursor);
        },
        rows(rows) {
            const row = rows.getLast();
            this.engine.clear();
            this.engine.resize(this.width, row.y + row.height);
            this.engine.drawRows(rows);
            this.cursor = this.cursor ? SingleCursor.fromOld(this.coMeasures, this.cursor) : new SingleCursor(this.coMeasures.head);
        }
    },
    mounted() {
        const renderer = new Renderer(this.$el.firstChild, Renderer.Backends.SVG);
        this.engine = new SvgEngine(renderer, this.$el.firstChild.firstChild);
    },
    directives : {
        coWatch
    }
}
</script>

<style>
.co-score-context {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
}
</style>