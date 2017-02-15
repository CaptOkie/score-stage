import { ACCENT_COLOR } from 'Common/constants';
import { NUM_EXTRA_LINES, X_SHIFT } from './constants';
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
            barlineX = Math.round(barlineX);
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
        const space = stave.getSpacingBetweenLines();

        // Handle cursor X
        const startX = stave.getNoteStartX();
        const tick = cursor.ticks[cursor.tickInfo.index];

        let x = startX + 24;
        let width = space;
        if (cursor.tickInfo.before) {
            let prev = undefined;
            for (let i = 1; i <= cursor.tickInfo.index; ++i) {
                const curr = cursor.ticks[cursor.tickInfo.index - i];
                if (!curr.shouldIgnoreTicks()) {
                    prev = curr;
                    break;
                }
            }
            if (prev) {
                x = prev.getNoteHeadEndX() + ((tick.getNoteHeadBeginX() - prev.getNoteHeadEndX()) / 2) - (width / 2);
            }
        }
        else if (tick) {
            const left = tick.getNoteHeadBeginX();
            const right = tick.getNoteHeadEndX();

            x = left;
            let diff = width - (right - left);
            if (diff <= 0) {
                width = right - left;
            }
            else {
                x -= diff / 2;
            }
        }


        // Handle cursor Y
        const y = stave.getYForLine(cursor.line.num) - (cursor.line.space ? 0 : space / 2);

        const group = this._makeGroup({
            'stroke-width' : 2,
            'stroke' : ACCENT_COLOR,
            'fill' : ACCENT_COLOR,
            'fill-opacity' : 0.5,
            'id' : 'co-score-cursor'
        });
        const lastLine = stave.getOptions().num_lines - 1;
        const numExtra = cursor.line.num < 0 ? Math.abs(cursor.line.num) : Math.max(0, cursor.line.num - lastLine);
        for (let i = 0; i < numExtra; ++i) {
            const num = cursor.line.num < 0 ? cursor.line.num : (lastLine + 1);
            const y = stave.getYForLine(num + i);
            const line = this._makeLine(x - 5, y, x + width + 5, y);
            group.appendChild(line);
        }
        group.appendChild(this._makeRect(x, y, width, space));
        this.el.appendChild(group);

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

    _makeLine(x1, y1, x2, y2, options = {}) {
        options.x1 = x1;
        options.y1 = y1;
        options.x2 = x2;
        options.y2 = y2;
        return this._makeElement('line', options);
    }

    _makeRect(x, y, width, height, options = {}) {
        options.x = x;
        options.y = y;
        options.width = width;
        options.height = height;
        return this._makeElement('rect', options);
    }

    _makeGroup(options = {}) {
        return this._makeElement('g', options);
    }

    _makeElement(name, options = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', name);
        for (const key in options) {
            element.setAttribute(key, options[key]);
        }
        return element;
    }
}

class SingleCursor {
    static fromPosition(index, measure, pos) {
        const barIndex = measure.getBarIndex(pos.y);
        const stave = measure.staves[barIndex];
        const voice = measure.voices[barIndex];

        // Get the X position info
        const startX = stave.getNoteStartX();
        const endX = stave.getNoteEndX();
        if (pos.x < startX || pos.x > endX) {
            return undefined;
        }

        const tickInfo = { index : 0, before : true };
        let prevTick = undefined;
        let currTick = undefined;
        for (const [ i, tick ] of voice.getTickables().entries()) {
            if (!tick.shouldIgnoreTicks()) {
                prevTick = currTick;
                currTick = tick;
                tickInfo.index = i;

                if (tick.getNoteHeadBeginX() > pos.x) {
                    break;
                }
            }
        }

        if (currTick) {
            let left = startX;
            const right = currTick.getNoteHeadBeginX();
            if (prevTick) {
                // TODO consider note head vs entire tick
                left = prevTick.getNoteHeadEndX();
                const diff = right - left;
                const first = left + (diff * 0.25);
                const second = left + (diff * 0.75);
                if (first > pos.x) {
                    tickInfo.index -= 1;
                    tickInfo.before = false;
                }
                else {
                    tickInfo.before = second > pos.x;
                }
            }
            else {
                const cutoff = left + ((right - left) * 0.75);
                tickInfo.before = cutoff > pos.x;
            }
        }

        // Get the Y position info
        const space = stave.getSpacingBetweenLines() / 2;
        const startY = stave.getYForLine(-NUM_EXTRA_LINES) - (space / 2);
        const endY = stave.getYForLine(stave.getOptions().num_lines + NUM_EXTRA_LINES - 1) + (space / 2);
        if (pos.y < startY || pos.y > endY) {
            return undefined;
        }

        let line = { num : -NUM_EXTRA_LINES, space : false };
        for (let y = (startY + space); y < pos.y; y += space) {
            if (line.space) {
                line.num += 1;
            }
            line.space = !line.space;
        }

        return new SingleCursor(index, measure, barIndex, tickInfo, line);
    }

    static fromOld(measures, old) {
            let index = 0;
            let barIndex = undefined;
            let tickInfo = undefined;
            let line = undefined;
            if (old) {
                index = Math.min(old.index, measures.length - 1);
                barIndex = old.barIndex;
                tickInfo = old.tickInfo;
                line = old.line;
            }
            return new SingleCursor(index, measures[index], barIndex, tickInfo, line);
    }

    constructor(index, measure, barIndex = 0, tickInfo = { index : 0, before : true }, line = { num : 0, space : false }) {
        this.index = index;
        this.measure = measure;
        this.barIndex = barIndex;
        this.tickInfo = tickInfo;
        this.line = line;
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

    get ticks() {
        return this.voice.getTickables();
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