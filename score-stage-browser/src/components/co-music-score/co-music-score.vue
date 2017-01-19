<template>
    <md-card class="md-flex" style="overflow: visible;">
        <md-card-content>
            <co-score-editor v-if="loaded" :co-measures="measures" :co-groups="groups" :co-bar-scale="2"
                    @add-measures="addMeasures" @delete-measure="deleteMeasure">
            </co-score-editor>
        </md-card-content>
    </md-card>
</template>

<script>
import 'Proxies/mdCard';
import 'Proxies/mdSpinner';
import coScoreEditor from './co-score-editor.vue';
import { Measure, TimeSignature, Tick, Note, Bar, Group } from './types';

export default {
    name : 'co-music-score',
    data() {
        return { groups : undefined, measures : undefined };
    },
    computed : {
        loaded() {
            return (this.measures && this.groups && true) || false;
        }
    },
    methods : {
        addMeasures(index) {
            const match = this.measures[index];
            const bars = match.bars.map(bar => new Bar(bar.clef, bar.keySig));
            const modifiers = {};
            if (index === this.measures.length - 1) {
                delete match.modifiers.end;
                modifiers.end = 'END';
            }
            this.measures.splice(index + 1, 0, new Measure(match.timeSig, bars, modifiers));
        },
        deleteMeasure(index) {
            if (this.measures.length > 1) {
                this.measures.splice(index, 1);
                if (index === this.measures.length) {
                    this.measures[this.measures.length - 1].modifiers.end = 'END';
                }
            }
        }
    },
    created() {
        this.measures = [ new Measure(new TimeSignature(4,4), [ new Bar('treble', 'C') ], { end : 'END' }) ];
        this.groups = [ new Group('Default', 'Def') ];

        // More accurate behaviour
        // setTimeout(() => {
        //     this.measures = [
        //         new Measure(new TimeSignature(3,4), [], { begin : 'REPEAT' }),
        //         new Measure(new TimeSignature(3,4), [], { end : 'REPEAT' }),
        //         new Measure(new TimeSignature(3,4), [], { begin : 'REPEAT' }),
        //         new Measure(new TimeSignature(5,8), []),
        //         new Measure(new TimeSignature(5,8), []),
        //         new Measure(new TimeSignature(6,8), []),
        //         new Measure(new TimeSignature(6,8), [], { end : 'REPEAT' }),
        //         new Measure(new TimeSignature(6,8), [], { begin : 'REPEAT', end : 'REPEAT' }),
        //         new Measure(new TimeSignature(3,4), []),
        //         new Measure(new TimeSignature(2,2), []),
        //         new Measure(new TimeSignature(4,4), []),
        //         new Measure(new TimeSignature(4,4), [], { end : 'END' })
        //     ].map(function(measure) {
                
        //         let ticks = [
        //             new Tick(8, [ new Note('a', 3, 'n'), new Note('b', 3, 'n') ]),
        //             new Tick(8, [ new Note('b', 3, '#') ]),
        //             new Tick(2, []),
        //             new Tick(4, []),
        //             new Tick(2, [ new Note('a', 3, 'n'), new Note('c', 4, 'n'), new Note('e', 4, 'b') ])
        //         ];
                
        //         let bars = [
        //             new Bar('treble', 'C', ticks),
        //             new Bar('bass', 'Eb', ticks),
        //             new Bar('treble', 'Cb', ticks),
        //             new Bar('treble', 'E', ticks),
        //             new Bar('bass', 'Db', ticks),
        //             new Bar('bass', 'C#', ticks)
        //         ]
        //         measure.bars = bars;
        //         return measure;
        //     });

        //     this.groups = [
        //         new Group('Clarinet', 'Clt', 2),
        //         new Group('Trumpet', 'Tpt', 1),
        //         new Group('Flute', 'Flt', 3)
        //     ];
        // }, 0);
    },
    components : {
        coScoreEditor
    }
}
</script>
