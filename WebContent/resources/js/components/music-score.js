angular.module('score-stage')
.directive('ssVexFlow', [ function() {
    
    var WIDTH = 1000;
    var MAX_WIDTH = WIDTH - 1;
    var BAR_SCALE = 2;
    
    function Row(y) {
        this.columns = [];
        this.y = y;
        this.width = 0;
        this.height = 0;
    }
    Row.prototype.addColumn = function(column) {
        this.columns.push(column);
        column.x = this.width;
        this.width += column.width;
        this.height = Math.max(this.height, column.height);
    };
    
    function Column() {
        this.x = 0;
        this.width = 0;
        this.height = 0;
        this.padding = { left : 0, right : 0 };
        this.staves = [];
        this.formatter = new Vex.Flow.Formatter();
        this.voices = [];
        this.beams = [];
        this.bars = [];
    }
    Column.prototype.addStave = function(stave) {
        this.height += stave.getBottomY() - stave.y;
        this.staves.push(stave);
        this.updatePadding(this.staves.length - 1);
    };
    Column.prototype.updatePadding = function(index) {
        this.width -= (this.padding.left + this.padding.right);
        if (angular.isDefined(index)) {
            var stave = this.staves[index];
            this.padding.left = Math.max(this.padding.left, stave.getNoteStartX());
            this.padding.right = Math.max(this.padding.right, stave.getWidth() - stave.getNoteEndX());
        }
        this.width += (this.padding.left + this.padding.right);
    };
    Column.prototype.joinVoices = function() {
        var formatter = this.formatter;
        this.voices.forEach(function(voice) {
            formatter.joinVoices([ voice ]);
        });
        this.width += (this.formatter.preCalculateMinTotalWidth(this.voices) * BAR_SCALE);
    };
    
    function getBeginBarline(stave) {
        return stave.getModifiers(Vex.Flow.StaveModifier.Position.BEGIN, 'barlines')[0];
    }
    
    function link(scope, element, attrs) {
        
        var renderer = new Vex.Flow.Renderer(element[0], Vex.Flow.Renderer.Backends.SVG);
        var context = renderer.getContext();
        var rows = [ new Row(0) ];
        
        function drawRow(row) {
            var prev = undefined;
            row.columns.forEach(function(column, index) {
                column.width = (column.width / row.width) * MAX_WIDTH;
                var width = column.width - column.padding.left - column.padding.right;
                column.x = (prev && (prev.x + prev.width)) || 0;
                var y = row.y;
                column.formatter.format(column.voices, width);
                var barlineX = column.x;
                column.staves.forEach(function(stave) {
                    stave.setX(column.x).setY(y).setWidth(column.width).setNoteStartX(column.x + column.padding.left);
                    y += stave.getBottomY() - stave.y;
                    barlineX = Math.max(barlineX, getBeginBarline(stave).getX());
                });
                column.staves.forEach(function(stave) {
                    getBeginBarline(stave).setX(barlineX);
                    stave.setContext(context).draw();
                });
                column.voices.forEach(function(voice, index) {
                    voice.draw(context, column.staves[index]);
                });
                column.beams.forEach(function(beam) {
                    beam.setContext(context).draw();
                });
                if (column.staves.length > 1) {
                    var first = column.staves[0];
                    var last = column.staves[column.staves.length - 1];
                    var modifiers = column.bars[0].modifiers;
                    var connector = SS.Bar.getEndLarge(modifiers.end);
                    new Vex.Flow.StaveConnector(first, last).setType(connector).setContext(context).draw();

                    connector = SS.Bar.getBeginLarge(modifiers.begin);
                    var shift = barlineX - column.x;
                    if (shift !== 0) {
                        new Vex.Flow.StaveConnector(first, last).setType(SS.Bar.getBeginLarge()).setContext(context).draw();
                    }
                    new Vex.Flow.StaveConnector(first, last).setType(connector).setContext(context).setXShift(shift).draw();
                }
                prev = column;
            });
            row.width = MAX_WIDTH;
        }
        
        function drawRows() {
            rows.forEach(drawRow);
        }
        
        scope.$watch('staves', function() {
            if (scope.staves) {
                var numBars = scope.staves.length && scope.staves[0].bars.length;
                for (var i = 0; i < numBars; ++i) {
                    var row = rows[rows.length - 1];
                    var column = new Column();
                    
                    function getPrev(index) {
                        var column = row.columns.length && row.columns[row.columns.length - 1];
                        return column && column.bars[index];
                    }
                    
                    scope.staves.forEach(function(staff) {
                        var index = column.bars.length;
                        var prev = getPrev(index);
                        var bar = staff.bars[i];
                        column.bars.push(bar);
                        
                        // Create Vex.Flow items
                        var notes = bar.ticks.map(function(tick) {
                            var keys = tick.notes.map(function(note) {
                                return note.letter + note.accidental + '/' + note.octave;
                            });
                            var duration = tick.duration + '';
                            if (tick.isRest()) {
                                keys = [ 'r/4' ];
                                duration += 'r';
                            }
                            return new Vex.Flow.StaveNote({ clef : staff.clef, keys : keys, duration : duration, auto_stem: true });
                        });
                        Vex.Flow.Beam.generateBeams(notes).forEach(function(beam) { 
                            column.beams.push(beam);
                        });
                        var voice = new Vex.Flow.Voice({ beat_value : bar.timeSig.upper, num_beats : bar.timeSig.lower }).setStrict(false).addTickables(notes);
                        Vex.Flow.Accidental.applyAccidentals([ voice ], bar.keySig);
                        column.voices.push(voice);
                        var stave = new Vex.Flow.Stave(0, 0, MAX_WIDTH);
                        stave.clef = staff.clef;
                        if (bar.modifiers.begin) {
                            stave.setBegBarType(SS.Bar.getBegin(bar.modifiers.begin));
                        }
                        if (bar.modifiers.end) {
                            stave.setEndBarType(SS.Bar.getEnd(bar.modifiers.end));
                        }
                        
                        // Add time signature if necessary
                        if (!prev || prev.timeSig.vexFormat() !== bar.timeSig.vexFormat()) {
                            stave.addTimeSignature(bar.timeSig.vexFormat());
                        }
                        
                        // Add key signature if necessary
                        if (!prev || prev.keySig !== bar.keySig) {
                            stave.setKeySignature(bar.keySig, prev && prev.keySig);
                        }
                        column.addStave(stave);
                    });
                    column.joinVoices();
                    
                    // New Block
                    if (i === 0 || (row.width + column.width) > MAX_WIDTH) {
                        var y = row.y + row.height;
                        row = new Row(y);
                        rows.push(row);
                        var index = 0;
                        scope.staves.forEach(function(staff) {
                            var bar = column.bars[index];
                            var prev = getPrev(index);
                            column.staves[index].setClef(staff.clef).setKeySignature(bar.keySig, prev && prev.keySig);
                            column.updatePadding(index);
                            ++index;
                        });
                    }
                    row.addColumn(column);
                }
                drawRows();
                var row = rows[rows.length - 1];
                renderer.resize(WIDTH, row.y + row.height);
            }
        });
    }
    
    return {
        restrict : 'E',
        link : link,
        scope : {
            staves : '='
        }
    };
} ])
.directive('ssMusicScore', [ function() {
    
    function link(scope, element, attrs) {
        
        scope.staves = [{ clef : 'treble', octave : 3 }, { clef : 'bass', octave : 3 }].map(function(item, i) {
            
            var bars = [
                    [3, 'C', { begin : 'REPEAT' }], [3, 'Eb', { end : 'REPEAT' }], [3, 'Eb', { begin : 'REPEAT' }], [3, 'Cb'], [4, 'Cb'], [4, 'Cb', { end : 'REPEAT' }],
                    [3, 'E', { begin : 'REPEAT', end : 'REPEAT' }], [4, 'E'], [4, 'C'], [4, 'C'], [4, 'C'], [4, 'Db'], [5, 'Db'], [4, 'Db'], [4, 'C#', { end : 'END' }]
            ]
            .map(function(items, j) {
                return new SS.Bar(new SS.TimeSignature(items[0], 4), i == 1 && j == 6 ? 'Eb' : items[1],
                        [
                            new SS.Tick(8, [ new SS.Note('a', item.octave, 'n') ]),
                            new SS.Tick(8, [ new SS.Note('b', item.octave, '#') ]),
                            new SS.Tick(2, []),
                            new SS.Tick(4, []),
                            new SS.Tick(2, [ new SS.Note('a', item.octave, 'n'), new SS.Note('c', item.octave + 1, 'n'), new SS.Note('e', item.octave + 1, 'b') ])
                        ], items[2]);
            });
            
            return new SS.Staff(item.clef, bars);
        });
    }
    
    return {
        restrict : 'E',
        link : link,
        template : 
            `<md-card flex="none" layout="column" layout-align="start center">
                <md-card-content flex layout="column" layout-align="start center">
                    <ss-vex-flow staves="staves" flex layout="column" layout-align="start center"></ss-vex-flow>
                </md-card-content>
            </md-card>`
    };
} ]);