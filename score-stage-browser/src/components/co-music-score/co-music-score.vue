<template>
    <md-card class="md-flex" style="overflow: visible;">
        <md-card-content>
            <co-score-rows :co-measures="measures" :co-groups="groups" :co-bar-scale="2"></co-score-rows>
        </md-card-content>
    </md-card>
</template>

<script>
import 'Proxies/mdCard';
import coScoreRows from './co-score-rows.vue';
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
    components : {
        coScoreRows
    },
    created() {
        // More accurate behaviour
        setTimeout(() => {
            this.measures = [
                new Measure(new TimeSignature(3,4), [], { begin : 'REPEAT' }),
                new Measure(new TimeSignature(3,4), [], { end : 'REPEAT' }),
                new Measure(new TimeSignature(3,4), [], { begin : 'REPEAT' }),
                new Measure(new TimeSignature(5,8), []),
                new Measure(new TimeSignature(5,8), []),
                new Measure(new TimeSignature(6,8), []),
                new Measure(new TimeSignature(6,8), [], { end : 'REPEAT' }),
                new Measure(new TimeSignature(6,8), [], { begin : 'REPEAT', end : 'REPEAT' }),
                new Measure(new TimeSignature(3,4), []),
                new Measure(new TimeSignature(2,2), []),
                new Measure(new TimeSignature(4,4), []),
                new Measure(new TimeSignature(4,4), [], { end : 'END' })
            ].map(function(measure) {
                
                let ticks = [
                    new Tick(8, [ new Note('a', 3, 'n') ]),
                    new Tick(8, [ new Note('b', 3, '#') ]),
                    new Tick(2, []),
                    new Tick(4, []),
                    new Tick(2, [ new Note('a', 3, 'n'), new Note('c', 4, 'n'), new Note('e', 4, 'b') ])
                ];
                
                let bars = [
                    new Bar('treble', 'C', ticks),
                    new Bar('bass', 'Eb', ticks),
                    new Bar('treble', 'Cb', ticks),
                    new Bar('treble', 'E', ticks),
                    new Bar('bass', 'Db', ticks),
                    new Bar('bass', 'C#', ticks)
                ]
                measure.bars = bars;
                return measure;
            });

            this.groups = [
                new Group('Clarinet', 'Clt', 2),
                new Group('Trumpet', 'Tpt', 1),
                new Group('Flute', 'Flt', 3)
            ];
        }, 0);
    }
}
</script>
