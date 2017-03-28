import { ACCENT_COLOR } from 'Common/constants';
import { NUM_EXTRA_LINES, X_SHIFT, X_PADDING } from './constants';
import Vex from 'vexflow';
const { Barline, StaveConnector, Formatter, StaveModifier } = Vex.Flow;

export class Note {
    static create(data) {
        return new Note(data.letter, data.octave, data.accidental);
    }

    static getRaw(note) {
        return note.getRaw();
    }

    constructor(letter, octave, accidental) {
        this.letter = letter;
        this.octave = octave;
        this.accidental = accidental;
    }

    compareTo(other) {
        const diff = this.octave - other.octave;
        if (diff) {
            return diff;
        }
        if (this.letter === other.letter) {
            return 0;
        }
        else if (this.letter === 'b') {
            return 1;
        }
        else if (other.letter === 'b') {
            return -1;
        }
        else if (this.letter === 'a') {
            return 1;
        }
        else if (other.letter === 'a') {
            return -1;
        }
        return this.letter > other.letter ? 1 : -1;
    }

    equals(other) {
        return this.compareTo(other) === 0;
    }

    getRaw() {
        return {
            letter : this.letter,
            octave : this.octave,
            accidental : this.accidental
        };
    }
}

export class Tick {
    static create(data) {
        const duration = data.duration;
        const notes = data.notes.map(Note.create);
        return new Tick(duration, notes);
    }

    static getRaw(tick) {
        return tick.getRaw();
    }

    constructor(duration, notes = []) {
        this.duration = duration;
        this.notes = notes;
    }

    isRest() {
        return !this.notes.length;
    }

    push(note) {
        const index = this.notes.findIndex(n => n.compareTo(note) >= 0);
        if (index < 0) {
            this.notes.push(note);
        }
        else {
            if (note.equals(this.notes[index])) {
                this.notes[index] = note;
            }
            else {
                this.notes.splice(index, 0, note);
            }
        }
    }

    delete(note) {
        const index = this.notes.findIndex(n => n.equals(note));
        if (index < 0) {
            return false;
        }
        this.notes.splice(index, 1);
        return true;
    }

    clear() {
        this.notes = [];
    }

    getRaw() {
        return {
            duration : this.duration,
            notes : this.notes.map(Note.getRaw)
        };
    }
}

export class TimeSignature {
    static get COMMON() { return new TimeSignature(4, 4, 'C'); }
    static get CUT() { return new TimeSignature(2, 2, 'C|'); }

    static create(data) {
        return new TimeSignature(data.upper, data.lower);
    }

    static getRaw(timeSig) {
        return timeSig.getRaw();
    }

    constructor(upper, lower, vexFormat = upper + '/' + lower) {
        this.upper = upper;
        this.lower = lower;
        this.vexFormat = vexFormat;
    }

    getRaw() {
        return {
            upper : this.upper,
            lower : this.lower
        };
    }
}

export class Bar {
    static create(data) {
        const clef = data.clef;
        const keySig = data.keySig;
        const ticks = data.ticks.map(Tick.create);
        return new Bar(clef, keySig, ticks);
    }

    constructor(clef, keySig, ticks = []) {
        this.clef = clef;
        this.keySig = keySig;
        this.ticks = ticks;
    }
}

export class Measure {
    static create(data) {
        const timeSig = TimeSignature.create(data.timeSig);
        const bars = data.bars.map(Bar.create);
        const id = data.id;
        const prev = data.prev;
        const next = data.next;
        return new Measure(timeSig, bars, id, prev, next);
    }

    constructor(timeSig, bars, id, prev, next) {
        this.timeSig = timeSig;
        this.bars = bars;
        this.id = id;
        this.prev = prev;
        this.next = next;
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

    addStave(stave) {
        this.staves.push(stave);
        stave.setY(this.height);
        this.height += (stave.getBottomY() - stave.y);

        this.updatePadding(this.staves.length - 1);
    }

    updatePadding(index) {
        this.width -= this.totalPadding();
        let stave = this.staves[index];
        this.padding.left = Math.max(this.padding.left, (stave.getNoteStartX() - stave.getX()) + X_PADDING);
        this.padding.right = Math.max(this.padding.right, (stave.getWidth() - (stave.getNoteEndX() - stave.getX())) + X_PADDING);
        this.width += this.totalPadding();
    }

    joinVoices(minWidth, barScale) {
        this.formatter = new Formatter();
        this.voices.forEach(voice => {
            this.formatter.joinVoices([ voice ]);
        });
        this.width += (Math.max(this.formatter.preCalculateMinTotalWidth(this.voices) || minWidth, minWidth) * barScale);
    }

    adjustWidth(maxWidth, row) {
        this.width = Math.floor((this.widthNoPadding() / row.widthNoPadding()) * (maxWidth - row.totalPadding()) + this.totalPadding());
    }

    format() {
        // VexFlow formats based on the first voice
        // Need to format based on the longest voice
        const voices = this.voices.slice().map(voice => {
                const width = new Formatter().joinVoices([ voice ]).preCalculateMinTotalWidth([ voice ]) || 0;
                return { voice, width };
            })
            .sort((a, b) => b.width - a.width)
            .map(item => item.voice);
        this.formatter.format(voices, this.widthNoPadding());
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

export class Measures {

    static link(before, after, toAdd) {
        if (before) {
            before.next = toAdd;
        }
        if (after) {
            after.prev = toAdd;
        }
        toAdd.next = after;
        toAdd.prev = before;
    }

    static addAfter(existing, toAdd) {
        Measures.link(existing, existing.next, toAdd);
    }

    static addBefore(existing, toAdd) {
        Measures.link(existing.prev, existing, toAdd);
    }

    static remove(existing) {
        const before = existing.prev;
        const after = existing.next;
        if (before) {
            before.next = after;
        }
        if (after) {
            after.prev = before;
        }
        existing.removed = true;
    }

    static create(measures) {
        measures = measures.map(Measure.create);
        const map = measures.reduce((prev, measure) => {
            prev[measure.id] = measure
            return prev;
        }, {});
        let head = undefined;
        for (const measure of measures) {
            if (measure.prev) {
                const prev = map[measure.prev];
                prev.next = measure;
                measure.prev = prev;
            }
            else {
                head = measure;
            }
        }
        return new Measures(head);
    }

    constructor(head) {
        this.head = head;
    }

    addAfter(existing, toAdd) {
        Measures.addAfter(existing, toAdd);
    }

    addBefore(existing, toAdd) {
        Measures.addBefore(existing, toAdd);
        if (existing === this.head) {
            this.head = toAdd;
        }
    }

    remove(existing) {
        if (existing === this.head) {
            this.head = this.head.next;
        }
        Measures.remove(existing);
    }

    forEach(callback) {
        let curr = this.head;
        while (curr) {
            callback(curr);
            curr = curr.next;
        }
    }

    [Symbol.iterator]() {
        let next = this.head;
        return {
            next() {
                const curr = next;
                next = curr && curr.next;
                return curr ? { value : curr, done : false } : { done : true };
            }
        };
    }
}

export class Group {
    static create(data) {
        return new Group(data.name, data.abbr, data.count);
    }

    constructor(name, abbr, count = 1) {
        this.name = name;
        this.abbr = abbr;
        this.count = count;
    }
}

export class Row {
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
                // NoteEndX can't be manually set
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
                let connector = !measure.next ? StaveConnector.type.BOLD_DOUBLE_RIGHT : StaveConnector.type.SINGLE_RIGHT;
                measure.connectors.push(new StaveConnector(first, last).setType(connector).setContext(context));
                
                const type = prev ? StaveConnector.type.SINGLE_LEFT : StaveConnector.type.DOUBLE;
                connector = new StaveConnector(first, last).setType(type);
                if (!prev) {
                    connector.setText(group.abbr);
                }
                measure.connectors.push(connector.setContext(context));
                
                start = end;
            });
            
            prev = measure;
        });
        this.width = maxWidth;
    }
}

export class Rows {
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

export class Position {
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

export class SvgEngine extends Engine {
    constructor(renderer, el) {
        super(renderer, el);
    }

    /*** Public methods ***/

    drawCursor(cursor) {
        this._clearCursor();
        const stave = cursor.stave;
        const space = stave.getSpacingBetweenLines();

        // Handle cursor X
        const startX = stave.getNoteStartX() - X_PADDING;
        // NoteEndX is never manaually set
        const endX = stave.getNoteEndX();
        const tick = cursor.ticks[cursor.tickInfo.index];

        let width = space;
        let x = startX + Math.round((X_PADDING / 2) - (width / 2));

        if (tick && !cursor.tickInfo.before) {
            const left = tick.getNoteHeadBeginX();
            const right = tick.getNoteHeadEndX();

            x = left;
            let diff = width - (right - left);
            if (diff <= 0) {
                width = right - left;
            }
            else {
                x -= Math.round(diff / 2);
            }
        }
        else {
            let prev = undefined;
            for (let i = cursor.tickInfo.index - 1; i >= 0; --i) {
                const curr = cursor.ticks[i];
                if (!curr.shouldIgnoreTicks()) {
                    prev = curr;
                    break;
                }
            }
            
            const start = prev ? prev.getNoteHeadEndX() : startX;
            const end = tick ? tick.getNoteHeadBeginX() : endX;
            x = start + Math.round(((end - start) / 2) - (width / 2));
        }

        // Handle cursor Y
        const y = stave.getYForLine(cursor.line.num) - (cursor.line.space ? 0 : Math.round(space / 2));

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

export class SingleCursor {
    static fromPosition(measure, pos) {
        const barIndex = measure.getBarIndex(pos.y);
        const stave = measure.staves[barIndex];
        const voice = measure.voices[barIndex];

        // Get the X position info
        const startX = stave.getNoteStartX() - X_PADDING;
        // NoteEndX is never manually set
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
            // TODO consider note head vs entire tick
            let left = startX;
            let right = currTick.getNoteHeadBeginX();
            if (pos.x > currTick.getNoteHeadEndX()) {
                left = currTick.getNoteHeadEndX();
                right = endX;
                const cutoff = left + ((right - left) * 0.25);
                if (pos.x > cutoff) {
                    tickInfo.index += 1;
                }
                else {
                    tickInfo.before = false;
                }
            }
            else if (prevTick) {
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

        return new SingleCursor(measure, barIndex, tickInfo, line);
    }

    static fromOld(measures, old) {
        const measure = old.measure.removed ? (old.measure.next || old.measure.prev) : old.measure;
        const bars = measure.bars;
        const barIndex = Math.min(old.barIndex, bars.length - 1);
        const tickInfo = old.tickInfo;
        const bar = bars[barIndex];
        if (tickInfo.index >= bar.ticks.length) {
            tickInfo.index = bar.ticks.length;
            tickInfo.before = true;
        }
        const line = old.line;
        return new SingleCursor(measure, barIndex, tickInfo, line);
    }

    constructor(measure, barIndex = 0, tickInfo = { index : 0, before : true }, line = { num : 0, space : false }) {
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
