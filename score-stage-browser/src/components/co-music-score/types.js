import { X_SHIFT } from './constants';
import Vex from 'vexflow';
const { Barline, StaveConnector, Formatter, StaveModifier } = Vex.Flow;

class Note {
    constructor(letter, octave, accidental) {
        this.letter = letter;
        this.octave = octave;
        this.accidental = accidental;
    }
}

class Tick {
    constructor(duration, notes = []) {
        this.duration = duration;
        this.notes = notes;
    }

    isRest() {
        return !this.notes.length;
    }
}

class TimeSignature {
    static get COMMON() { return new TimeSignature(4, 4, 'C'); }
    static get CUT() { return new TimeSignature(2, 2, 'C|'); }

    constructor(upper, lower, vexFormat = upper + '/' + lower) {
        this.upper = upper;
        this.lower = lower;
        this.vexFormat = vexFormat;
    }
}

class Bar {
    constructor(clef, keySig, ticks = []) {
        this.clef = clef;
        this.keySig = keySig;
        this.ticks = ticks;
    }
}

class Measure {
    constructor(timeSig, bars, modifiers = {}) {
        this.timeSig = timeSig;
        this.bars = bars;
        this.modifiers = modifiers;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.padding = { left : 0, right : 0 };
        this.staves = [];
        this.formatter = undefined;
        this.voices = [];
        this.beams = [];
        this.connectors = [];
    }

    widthNoPadding() {
        return this.width - this.totalPadding();
    }

    totalPadding() {
        return this.padding.left + this.padding.right;
    }

    vexBegin() {
        switch (this.modifiers.begin) {
            case 'REPEAT': return Barline.type.REPEAT_BEGIN;
            default:       return undefined;
        }
    }

    vexEnd() {
        switch (this.modifiers.end) {
            case 'REPEAT': return Barline.type.REPEAT_END;
            case 'END':    return Barline.type.END;
            default:       return undefined;
        }
    }
    
    vexBeginLarge() {
        switch (this.modifiers.begin) {
            case 'REPEAT': return StaveConnector.type.BOLD_DOUBLE_LEFT;
            default:       return undefined;
        }
    }

    vexEndLarge() {
        switch (this.modifiers.end) {
            case 'REPEAT': // Fall through
            case 'END':    return StaveConnector.type.BOLD_DOUBLE_RIGHT;
            default:       return StaveConnector.type.SINGLE_RIGHT;
        }
    }

    addStave(stave) {
        this.staves.push(stave);
        stave.setY(this.height);
        this.height += (stave.getBottomY() - stave.y);

        this.updatePadding(this.staves.length - 1);
    }

    updatePadding(index) {
        this.width -= this.totalPadding();
        var stave = this.staves[index];
        this.padding.left = Math.max(this.padding.left, stave.getNoteStartX() - stave.getX());
        this.padding.right = Math.max(this.padding.right, stave.getWidth() - (stave.getNoteEndX() - stave.getX()));
        this.width += this.totalPadding();
    }

    joinVoices(minWidth, barScale) {
        var formatter = this.formatter = new Formatter();
        this.voices.forEach(function(voice) {
            formatter.joinVoices([ voice ]);
        });
        this.width += (Math.max(this.formatter.preCalculateMinTotalWidth(this.voices) || minWidth, minWidth) * barScale);
    }

    adjustWidth(maxWidth, row) {
        this.width = Math.floor((this.widthNoPadding() / row.widthNoPadding()) * (maxWidth - row.totalPadding()) + this.totalPadding());
    }

    format() {
        this.formatter.format(this.voices, this.widthNoPadding());
    }

    getBarIndex(y) {
        let prev = 0;
        for (const [ index, stave ] of this.staves.entries()) {
            if (stave.y > y) {
                break;
            }
            prev = index;
        }
        return prev;
    }

    getFirst(field) {
        return this[field][0];
    }

    getLast(field) {
        field = this[field];
        return field[field.length - 1];
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        let prev = undefined;
        this.staves.forEach(stave => {
            let y = prev ? prev.getBottomY() : this.y;
            stave.setY(y);
            prev = stave;
        });
    }
}

class Group {
    constructor(name, abbr, count) {
        this.name = name;
        this.abbr = abbr;
        this.count = count;
        this.visible = true;
    }
}

class Row {
    constructor(y) {
        this.measures = [];
        this.x = 0;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.padding = { left : 0, right: 0 };
    }

    addMeasure(measure) {
        this.measures.push(measure);
        measure.setPosition(this.width, this.y);
        this.width += measure.width;
        this.height = Math.max(this.height, measure.height);
        this.padding.left += measure.padding.left;
        this.padding.right += measure.padding.right;
    }

    widthNoPadding() {
        return this.width - this.totalPadding();
    }

    totalPadding() {
        return this.padding.left + this.padding.right;
    }

    getMeasure(x) {
        let prev = undefined;
        for (const measure of this.measures) {
            if (measure.x > x) {
                break;
            }
            prev = measure;
        }
        return prev;
    }

    getFirst() {
        return this.measures[0];
    }

    getLast() {
        return this.measures[this.measures.length - 1];
    }

    setup(context, maxWidth, groups) {
        function getBeginBarline(stave) {
            return stave.getModifiers(StaveModifier.Position.BEGIN, 'barlines')[0];
        }

        let prev = undefined;
        this.measures.forEach(measure => {
            measure.adjustWidth(maxWidth, this);
            measure.x = (prev && (prev.x + prev.width)) || X_SHIFT;
            measure.format();

            let barlineX = measure.x;
            measure.staves.forEach(stave => {
                stave.setX(measure.x).setWidth(measure.width).setNoteStartX(measure.x + measure.padding.left);
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
        });
        this.width = maxWidth;
    }
}

class Rows {
    constructor(rows) {
        this.rows = rows;
    }

    getRow(y) {
        let prev = undefined;
        for (const row of this.rows) {
            if (row.y > y) {
                break;
            }
            prev = row;
        }
        return prev;
    }

    getFirst() {
        return this.rows[0];
    }

    getLast() {
        return this.rows[this.rows.length - 1];
    }
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Engine {
    constructor(renderer, el) {
        this.renderer = renderer;
        this.el = el;
    }

    setup(rows, maxWidth, groups) {
        rows.rows.forEach(row => row.setup(this.renderer.getContext(), maxWidth, groups));
    }

    getPosition(event) {
        const rect = this.el.getBoundingClientRect();
        return new Position(event.clientX - rect.left, event.clientY - rect.top);
    }

    drawRows(rows) {
        rows.rows.forEach(row => this.drawRow(row));
    }

    drawRow(row) {
        row.measures.forEach(measure => this.drawMeasure(measure));
    }

    drawMeasure(measure) {
        [ 'staves', 'voices', 'beams', 'connectors' ].forEach(field => {
            measure[field].forEach(item => item.draw());
        });
    }

    resize(width, height) {
        this.renderer.resize(width, height);
    }
}

class SvgEngine extends Engine {
    constructor(renderer, el) {
        super(renderer, el);
    }

    /*** Public methods ***/

    drawCursor(cursor) {
        this._clearCursor();

        const stave = cursor.stave;
        const startX = stave.getNoteStartX();
        let left = 0;
        let right = 0;
        const tick = cursor.tick;
        if (tick && !tick.shouldIgnoreTicks()) {
            left = tick.getNoteHeadBeginX();
            right = tick.getNoteHeadEndX();
        }
        let x = startX + 24;
        if (left && right) {
            x = (left + right) / 2;
        }
        this._drawLine(x, stave.y, x, stave.getBottomY(), { width : 3, stroke : '#E91E63', alpha : 0.5 });

        this.cursor = cursor;
        return this;
    }

    clear() {
        while (this.el.lastChild) {
            this.el.removeChild(this.el.lastChild);
        }
    }

    /*** Private methods ***/

    _clearCursor() {
        const cursor = document.getElementById('co-score-cursor');
        if (cursor) {
            cursor.parentElement.removeChild(cursor);
        }
    }

    _drawLine(startX, startY, endX, endY, options = {}) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        if (options.width) {
            line.setAttribute('stroke-width', options.width);
        }
        if (options.stroke) {
            line.setAttribute('stroke', options.stroke);
        }
        if (options.alpha !== undefined && options.alpha !== null) {
            line.setAttribute('stroke-opacity', options.alpha);
        }
        line.setAttribute('id', 'co-score-cursor');
        this.el.appendChild(line);
    }
}

class CanvasEngine extends Engine {
    constructor(renderer, el) {
        super(renderer, el);
        this.context = el.getContext('2d');
    }

    /*** Public methods ***/

    drawCursor(cursor) {
        this._clearCursor();

        const stave = cursor.stave;
        const startX = stave.getNoteStartX();
        let left = 0;
        let right = 0;
        const tick = cursor.tick;
        if (tick && !tick.shouldIgnoreTicks()) {
            left = tick.getNoteHeadBeginX();
            right = tick.getNoteHeadEndX();
        }
        let x = startX + 24;
        if (left && right) {
            x = (left + right) / 2;
        }
        this._drawLine(x, stave.y, x, stave.getBottomY(), { width : 3, stroke : '#E91E63', alpha : 0.5 });

        this.cursor = cursor;
        this.cursor.drawn = true;
        return this;
    }

    clear() {
        this._clearRect(0, 0, this.el.width, this.el.height);
    }

    //*** Overrides

    resize(width, height) {
        super.resize(width, height);
        if (this.cursor) {
            this.cursor.drawn = false;
        }
    }

    /*** Private methods ***/

    _clearCursor() {
        if (!this.cursor || !this.cursor.drawn) {
            return;
        }

        let x = this.cursor.measure.x;
        let width = this.cursor.measure.width;
        if (x === X_SHIFT) {
            x = 0;
            width += X_SHIFT;
        }
        this._clearRect(x, this.cursor.measure.y, width, this.cursor.measure.getLast('staves').getBottomY() - this.cursor.measure.y);
        this.drawMeasure(this.cursor.measure);
        this.cursor.drawn = false;
        return this;
    }

    _drawLine(startX, startY, endX, endY, options = {}) {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        if (options.width) {
            this.context.lineWidth = options.width;
        }
        this.context.lineTo(endX, endY);
        if (options.stroke) {
            this.context.strokeStyle = options.stroke;
        }
        if (options.alpha !== undefined && options.alpha !== null) {
            this.context.globalAlpha = options.alpha;
        }
        this.context.stroke();
        this.context.closePath();
        this.context.restore();
        return this;
    }

    _clearRect(x, y, width, height) {
        this.context.clearRect(x, y, width, height);
        return this;
    }
}

class SingleCursor {
    static fromPosition(index, measure, pos) {
        const barIndex = measure.getBarIndex(pos.y);
        let tickIndex = 0;
        for (const [ i, tick ] of measure.voices[barIndex].getTickables().entries()) {
            if (!tick.shouldIgnoreTicks() && tick.getNoteHeadBeginX() > pos.x) {
                break;
            }
            tickIndex = i;
        }
        return new SingleCursor(index, measure, barIndex, tickIndex);
    }

    constructor(index, measure, barIndex, tickIndex) {
        this.index = index;
        this.measure = measure;
        this.barIndex = barIndex;
        this.tickIndex = tickIndex;
    }

    get type() {
        return SingleCursor;
    }

    get bar() {
        return this.measure.bars[this.barIndex];
    }

    get stave() {
        return this.measure.staves[this.barIndex];
    }

    get voice() {
        return this.measure.voices[this.barIndex];
    }

    get tick() {
        return this.voice.getTickables()[this.tickIndex];
    }
}

export {
    Note,
    Tick,
    TimeSignature,
    Bar,
    Measure,
    Group,
    Row,
    Rows,
    Position,
    SvgEngine,
    SingleCursor
}