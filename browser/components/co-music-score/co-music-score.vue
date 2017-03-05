<template>
    <md-card class="md-flex" style="overflow: visible;" @contextmenu.native.prevent="contextmenu">
        <md-card-content>
            <co-score-editor v-if="loaded" :co-measures="measures" :co-groups="groups" :co-bar-scale="2"
                    @cursor-changed="cursorChanged">
            </co-score-editor>
        </md-card-content>

        <md-menu ref="menu" style="display: none;" :md-size="6" :md-offset-x="menuX" :md-offset-y="menuY">
            <div md-menu-trigger></div>
            <md-menu-content>
                <md-menu-item @click="addMeasures">
                    <md-icon>playlist_add</md-icon>
                    <span>Add measure</span>
                    <span class="md-list-action co-score-key-text">Ctrl+A</span>
                </md-menu-item>

                <md-menu-item @click="deleteMeasure">
                    <md-icon>delete_sweep</md-icon>
                    <span>Delete measure</span>
                    <span class="md-list-action co-score-key-text">Ctrl+D</span>
                </md-menu-item>

                <md-menu-item @click="setTimeSig" class="md-inset">
                    <span>Edit time signature</span>
                    <span class="md-list-action co-score-key-text">Ctrl+T</span>
                </md-menu-item>

                <md-divider></md-divider>

                <md-menu-item @click="setKeySig">
                    <md-icon>vpn_key</md-icon>
                    <span>Change key signature</span>
                    <span class="md-list-action co-score-key-text">Ctrl+K</span>
                </md-menu-item>

                <md-menu-item @click="setClef" class="md-inset">
                    <span>Change clef</span>
                    <span class="md-list-action co-score-key-text">Ctrl+L</span>
                </md-menu-item>
            </md-menu-content>
        </md-menu>

        <co-time-signature-dialog ref="timeSigDialog"></co-time-signature-dialog>
        <co-key-signature-dialog ref="keySigDialog"></co-key-signature-dialog>
        <co-clef-dialog ref="clefDialog"></co-clef-dialog>
    </md-card>
</template>

<script>
import 'Proxies/mdCard';
import 'Proxies/mdIcon';
import 'Proxies/mdDivider';
import 'Proxies/mdMenu';
import coTimeSignatureDialog from './co-time-signature-dialog.vue';
import coKeySignatureDialog from './co-key-signature-dialog.vue';
import coClefDialog from './co-clef-dialog.vue';
import coScoreEditor from './co-score-editor.vue';
import { Measure, TimeSignature, Tick, Note, Bar, Group } from './types';
import { getNote } from './note-utils';

export default {
    name : 'co-music-score',
    props : [ 'coNote' ],
    data() {
        return { groups : undefined, measures : undefined, menuX : 0, menuY : 0 };
    },
    computed : {
        loaded() {
            return (this.measures && this.groups && true) || false;
        }
    },
    methods : {
        contextmenu(event) {
            this.menuX = event.clientX;
            this.menuY = event.clientY;
            this.$nextTick(() => this.$refs.menu.open());
        },
        addMeasures() {
            if (this.cursor) {
                const bars = this.cursor.measure.bars.map(bar => new Bar(bar.clef, bar.keySig));
                const modifiers = {};
                if (this.cursor.index === this.measures.length - 1) {
                    delete this.cursor.measure.modifiers.end;
                    modifiers.end = 'END';
                }
                this.measures.splice(this.cursor.index + 1, 0, new Measure(this.cursor.measure.timeSig, bars, modifiers));
            }
        },
        deleteMeasure() {
            if (this.cursor && this.measures.length > 1) {
                this.measures.splice(this.cursor.index, 1);
                if (this.cursor.index === this.measures.length) {
                    const modifiers = this.measures[this.measures.length - 1].modifiers;
                    modifiers.end = modifiers.end || 'END';
                }
            }
        },
        setTimeSig() {
            this.$refs.timeSigDialog.show(this.cursor.measure.timeSig, data => {
                this.cursor.measure.timeSig = data.timeSig;
            });
        },
        setKeySig() {
            this.$refs.keySigDialog.show(this.cursor.bar.keySig, data => {
                this.cursor.bar.keySig = data.keySig;
            });
        },
        setClef() {
            this.$refs.clefDialog.show(this.cursor.bar.clef, data => {
                this.cursor.bar.clef = data.clef;
            });
        },
        cursorChanged(cursor) {
            this.cursor = cursor;
        },
        keyup(event) {
            // TODO Ignore some events (e.g. key events on inputs)
            if (event.ctrlKey && event.shiftKey) {
                // Empty
            }
            else if (event.shiftKey) {
                switch (event.keyCode) {
                    case 65: 
                        this.addTick();
                        break;
                    case 68:
                        this.deleteTick();
                        break;
                    default:
                        // Don't care
                        break;
                }
            }
            else if (event.ctrlKey) {
                // Empty
            }
            else {
                // Empty
            }
        },
        addTick() {
            if (!this.coNote || !this.cursor) {
                return;
            }

            const duration = Number(this.coNote.duration);
            const bar = this.cursor.bar;
            const ticks = bar.ticks;
            const index = this.cursor.tickInfo.index;
            let tick = undefined;
            if (this.cursor.tickInfo.before) {
                tick = new Tick(duration, []);
                ticks.splice(index, 0, tick);
            }
            else {
                tick = ticks[index];
                tick.duration = duration;
            }
            if (this.coNote.rest) {
                tick.clear();
            }
            else {
                const note = getNote(bar.clef, this.cursor.line);
                tick.push(new Note(note.letter, note.octave, 'n'));
            }
        },
        deleteTick() {
            if (!this.cursor || this.cursor.tickInfo.before) {
                return;
            }

            const bar = this.cursor.bar;
            const note = getNote(bar.clef, this.cursor.line);
            const ticks = bar.ticks;
            const index = this.cursor.tickInfo.index;
            const tick = ticks[index];
            if (!tick.delete(note)) {
                ticks.splice(index, 1);
            }
        }
    },
    created() {

        // More accurate behaviour
        setTimeout(() => {
            this.measures = [ new Measure(new TimeSignature(4,4), [ new Bar('treble', 'C') ], { end : 'END' }) ];
            this.groups = [ new Group('Default', 'Def') ];

            // this.measures = [
            //     new Measure(new TimeSignature(3,4), [], { begin : 'REPEAT' }),
            //     new Measure(new TimeSignature(3,4), [], { end : 'REPEAT' }),
            //     new Measure(new TimeSignature(3,4), [], { begin : 'REPEAT' }),
            //     new Measure(new TimeSignature(5,8), []),
            //     new Measure(new TimeSignature(5,8), []),
            //     new Measure(new TimeSignature(6,8), []),
            //     new Measure(new TimeSignature(6,8), [], { end : 'REPEAT' }),
            //     new Measure(new TimeSignature(6,8), [], { begin : 'REPEAT', end : 'REPEAT' }),
            //     new Measure(new TimeSignature(3,4), []),
            //     new Measure(new TimeSignature(2,2), []),
            //     new Measure(new TimeSignature(4,4), []),
            //     new Measure(new TimeSignature(4,4), [], { end : 'END' })
            // ].map(function(measure) {
                
            //     let ticks = [
            //         new Tick(8, [ new Note('a', 3, 'n'), new Note('b', 3, 'n') ]),
            //         new Tick(8, [ new Note('b', 3, '#') ]),
            //         new Tick(2, []),
            //         new Tick(4, []),
            //         new Tick(2, [ new Note('a', 3, 'n'), new Note('c', 4, 'n'), new Note('e', 4, 'b') ])
            //     ];
                
            //     let bars = [
            //         new Bar('treble', 'C', ticks),
            //         new Bar('bass', 'Eb', ticks),
            //         new Bar('treble', 'Cb', ticks),
            //         new Bar('treble', 'E', ticks),
            //         new Bar('bass', 'Db', ticks),
            //         new Bar('bass', 'C#', ticks)
            //     ]
            //     measure.bars = bars;
            //     return measure;
            // });

            // this.groups = [
            //     new Group('Clarinet', 'Clt', 2),
            //     new Group('Trumpet', 'Tpt', 1),
            //     new Group('Flute', 'Flt', 3)
            // ];
        }, 0);
    },
    mounted() {
        document.body.addEventListener('keyup', this.keyup);
    },
    beforeDestroy() {
        document.body.removeEventListener('keyup', this.keyup);
    },
    components : {
        coTimeSignatureDialog,
        coKeySignatureDialog,
        coClefDialog,
        coScoreEditor
    }
}
</script>

<style>
.md-list-item .md-list-item-holder .md-list-action.co-score-key-text {
    margin-right: 0;
    color: rgba(0, 0, 0, .57);
}
</style>