import Vue from 'vue';
import constants from './constants';
import Vex from 'vexflow';
const { StaveModifier, Renderer, StaveConnector } = Vex.Flow;

function getBeginBarline(stave) {
    return stave.getModifiers(StaveModifier.Position.BEGIN, 'barlines')[0];
}

var renderers = {};
function update(el, binding) {
    const { common, row } = binding.value;
    const { width, maxWidth, barScale, groups } = common;
    const id = el.id;
    const isCanvas = el.tagName.toLowerCase() === 'canvas';
    const renderer = renderers[id] = renderers[id] || new Renderer(el, isCanvas ? Renderer.Backends.CANVAS : Renderer.Backends.SVG);
    if (!width || !maxWidth || !barScale || !row || !groups) {
        return;
    }

    function render() {
        if (!isCanvas) {
            const svg = el.childNodes[0];
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }
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
                stave.setContext(context);
            });
            
            measure.voices.forEach((voice, index) => voice.setContext(context).setStave(measure.staves[index]));
            measure.beams.forEach(beam => beam.setContext(context));
            
            let start = 0;
            if (!prev) {
                const conn = new StaveConnector(measure.staves[0], measure.staves[measure.staves.length - 1])
                    .setType(StaveConnector.type.SINGLE_LEFT).setContext(context);
                measure.connectors.push(conn);
            }
            groups.forEach((group, index) => {
                const end = index === (groups.length - 1) ? measure.staves.length : start + group.count;
                
                const first = measure.staves[start];
                const last = measure.staves[end - 1];
                let connector = measure.vexEndLarge();
                measure.connectors.push(new StaveConnector(first, last).setType(connector).setContext(context));
                
                connector = measure.vexBeginLarge();
                let shift = barlineX - measure.x;
                if (!connector || shift !== 0) {
                    let type = prev ? StaveConnector.type.SINGLE_LEFT : StaveConnector.type.DOUBLE;
                    let conn = new StaveConnector(first, last).setType(type);
                    if (!prev) {
                        conn.setText(group.abbr);
                    }
                    measure.connectors.push(conn.setContext(context));
                }
                if (connector) {
                    measure.connectors.push(new StaveConnector(first, last).setType(connector).setContext(context).setXShift(shift));
                }
                
                start = end;
            });
            
            prev = measure;
            height = Math.max(height, y);
        });
        row.width = maxWidth;
        renderer.resize(width, height);
        row.draw();
    }

    // Check if attached to document
    if (isCanvas || document.getElementById(id)) {
        render();
    }
    else {
        Vue.nextTick(render);
    }
}

export default {
    bind : update,
    update,
    unbind(el, binding) {
        renderers[el.id] = undefined;
    }
}