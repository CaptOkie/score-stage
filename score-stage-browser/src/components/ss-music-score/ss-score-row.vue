<template>
    <div></div>
</template>

<script>
import Vue from 'vue';
import constants from './constants';
import Vex from 'vexflow';
const { StaveModifier, Renderer, StaveConnector } = Vex.Flow;

function getBeginBarline(stave) {
    return stave.getModifiers(StaveModifier.Position.BEGIN, 'barlines')[0];
}

export default {
    name : 'ss-score-row',
    props : [ 'row', 'groups', 'viewWidth', 'maxWidth', 'barScale' ],
    data() {
        return { renderer : undefined, unwatch : undefined };
    },
    computed : {
        renderData() {
            return { width : this.viewWidth, maxWidth : this.maxWidth, barScale : this.barScale, row : this.row, groups : this.groups, renderer : this.renderer };
        }
    },
    methods : {
        watch(data, oldData) {
            console.log('watch-trigger');
            const { width, maxWidth, barScale, row, groups, renderer } = data;
            if (!width || !maxWidth || !barScale || !row || !groups || !renderer) {
                return;
            }
            this.unwatch();
            this.unwatch = undefined;

            const svg = this.$el.getElementsByTagName('svg')[0];
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }

            const context = renderer.getContext();
            let prev = undefined;
            let height = 0;
            row.measures.forEach(measure => {
                measure.adjustWidth(maxWidth, row);
                measure.x = (prev && (prev.x + prev.width)) || constants.xShift;
                measure.format();

                let y = 0;
                let barlineX = measure.x;
                measure.staves.forEach(stave => {
                    stave.setX(measure.x).setY(y).setWidth(measure.width).setNoteStartX(measure.x + measure.padding.left);
                    y += stave.getBottomY() - stave.y;
                    barlineX = Math.max(barlineX, getBeginBarline(stave).getX());
                });
                measure.staves.forEach(stave => {
                    getBeginBarline(stave).setX(barlineX);
                    stave.setContext(context).draw();
                });
                
                measure.voices.forEach((voice, index) => voice.draw(context, measure.staves[index]));
                measure.beams.forEach(beam => beam.setContext(context).draw());
                
                let start = 0;
                groups.forEach((group, index) => {
                    const end = index === (groups.length - 1) ? measure.staves.length : start + group.count;
                    
                    const first = measure.staves[start];
                    const last = measure.staves[end - 1];
                    let connector = measure.vexEndLarge();
                    new StaveConnector(first, last).setType(connector).setContext(context).draw();
                    
                    connector = measure.vexBeginLarge();
                    let shift = barlineX - measure.x;
                    if (!connector || shift !== 0) {
                        let type = prev ? StaveConnector.type.SINGLE_LEFT : StaveConnector.type.DOUBLE;
                        let conn = new StaveConnector(first, last).setType(type);
                        if (!prev) {
                            conn.setText(group.abbr);
                        }
                        conn.setContext(context).draw();
                    }
                    if (connector) {
                        new StaveConnector(first, last).setType(connector).setContext(context).setXShift(shift).draw();
                    }
                    
                    start = end;
                });
                if (!prev) {
                    new StaveConnector(measure.staves[0], measure.staves[measure.staves.length - 1]).setType(StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
                }
                
                prev = measure;
                height = Math.max(height, y);
            });
            row.width = maxWidth;
            renderer.resize(width, height);

            Vue.nextTick(() => {
                this.unwatch = this.$watch('renderData', this.watch);
            });
        }
    },
    mounted() {
        this.renderer = new Renderer(this.$el, Renderer.Backends.SVG);
    },
    created() {
        this.unwatch = this.$watch('renderData', this.watch);
    },
}
</script>