<template>
	<div></div>
</template>

<script>
	import constants from './constants';
	import Vex from 'vexflow';
	const { StaveModifier, Renderer, StaveConnector } = Vex.Flow;

    function getBeginBarline(stave) {
        return stave.getModifiers(StaveModifier.Position.BEGIN, 'barlines')[0];
    }
    
	export default {
		name : 'ss-score-row',
		props : [ 'row', 'groups', 'viewWidth', 'maxWidth', 'barScale' ],
		mounted() {
	        var renderer = new Renderer(this.$el, Renderer.Backends.SVG);
	        var context = renderer.getContext();
	        
            if (!this.viewWidth || !this.maxWidth || !this.barScale || !this.row) {
                return;
            }
            
            var prev = undefined;
            var height = 0;
            this.row.measures.forEach(measure => {
                measure.width = (measure.widthNoPadding() / this.row.widthNoPadding()) * (this.maxWidth - this.row.totalPadding()) + measure.totalPadding();
                measure.x = (prev && (prev.x + prev.width)) || constants.xShift;
                measure.formatter.format(measure.voices, measure.widthNoPadding());

                var y = 0;
                var barlineX = measure.x;
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
                
                var start = 0;
                this.groups.forEach((group, index) => {
                    var end = index === (this.groups.length - 1) ? measure.staves.length : start + group.count;
                    
                    var first = measure.staves[start];
                    var last = measure.staves[end - 1];
                    var connector = measure.vexEndLarge();
                    new StaveConnector(first, last).setType(connector).setContext(context).draw();
                    
                    connector = measure.vexBeginLarge();
                    var shift = barlineX - measure.x;
                    if (!connector || shift !== 0) {
                        var type = prev ? StaveConnector.type.SINGLE_LEFT : StaveConnector.type.DOUBLE;
                        var conn = new StaveConnector(first, last).setType(type);
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
            this.row.width = this.maxWidth;
            renderer.resize(this.viewWidth, height);
		}
	}
</script>