<template>
    <md-card class="md-flex" style="overflow: visible;">
        <md-card-content>
            <ss-score-rows :ss-measures="measures" :ss-groups="groups" :ss-bar-scale="2"></ss-score-rows>
        </md-card-content>
    </md-card>
</template>

<script>
import 'Proxies/mdCard';
import ssScoreRows from './ss-score-rows.vue';
import { Measure, TimeSignature, Tick, Note, Bar, Group } from './types';

export default {
    name : 'ss-music-score',
    data() {
        return { groups : undefined, measures : undefined };
    },
    computed : {
        loaded() {
            return (this.measures && this.groups && true) || false;
        }
    },
    components : {
        ssScoreRows
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
