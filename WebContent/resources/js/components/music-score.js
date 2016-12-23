angular.module('score-stage')
.directive('ssVexFlow', [ function() {
    
    var WIDTH = 1000;
    var MAX_WIDTH = WIDTH - 1;
    var BAR_SCALE = 2;
    
    function getStavePadding(stave) {
        var padding = stave.getNoteStartX() + stave.getWidth() - stave.getNoteEndX();
        var mods = stave.getModifiers().reduce(function(prev, curr) {
            if (curr.getPosition() === Vex.Flow.StaveModifier.Position.END) {
                return prev + curr.getWidth() + curr.getPadding();
            }
            return prev;
        }, 0);
        return padding + mods;
    }
    
    function link(scope, element, attrs) {
        
        var bars =
            [
                [3, 'C', { begin : 'REPEAT' }], [3, 'Eb', { end : 'REPEAT' }], [3, 'Eb', { begin : 'REPEAT' }], [3, 'Cb'], [4, 'Cb'], [4, 'Cb', { end : 'REPEAT' }],
                [3, 'E', { begin : 'REPEAT', end : 'REPEAT' }], [4, 'E'], [4, 'C'], [4, 'C'], [4, 'C'], [4, 'Db'], [5, 'Db'], [4, 'Db'], [4, 'C#', { end : 'END' }]
            ]
            .map(function(items) {
                return new SS.Bar(new SS.TimeSignature(items[0], 4), items[1],
                        [
                            new SS.Tick(8, [ new SS.Note('a', 4, 'n') ]),
                            new SS.Tick(8, [ new SS.Note('b', 4, '#') ]),
                            new SS.Tick(2, []),
                            new SS.Tick(4, []),
                            new SS.Tick(2, [ new SS.Note('a', 4, 'n'), new SS.Note('c', 5, 'n'), new SS.Note('e', 5, 'b') ])
                        ], items[2]);
            });
        
        var renderer = new Vex.Flow.Renderer(element[0], Vex.Flow.Renderer.Backends.SVG);
        var context = renderer.getContext();
        
        function drawRow(row) {
            var currWidth = row.items.reduce(function(prev, curr) {
                return prev + curr.stave.getWidth();
            }, 0);
            
            // Adjust to the percentage
            var prev = undefined;
            row.items.forEach(function(item) {
                var staveWidth = (item.stave.getWidth() / currWidth) * MAX_WIDTH;
                var voiceWidth = staveWidth - getStavePadding(item.stave);
                
                var x = (prev && (prev.stave.getX() + prev.stave.getWidth())) || 0;
                item.stave.setX(x).setWidth(staveWidth).setContext(context).draw();
                item.formatter.format([ item.voice ], voiceWidth);
                item.voice.draw(context, item.stave);
                item.beams.forEach(function(beam) {
                    beam.setContext(context).draw();
                });
                
                prev = item;
            });
        }
        
        var row = { items : [] };
        bars.forEach(function(bar, index) {
            
            var clef = 'treble';
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
                return new Vex.Flow.StaveNote({ clef : clef, keys : keys, duration : duration, auto_stem: true });
            });
            var beams = Vex.Flow.Beam.generateBeams(notes);
            var voice = new Vex.Flow.Voice({ beat_value : bar.timeSig.upper, num_beats : bar.timeSig.lower }).setStrict(false).addTickables(notes);
            Vex.Flow.Accidental.applyAccidentals([ voice ], bar.keySig);
            var formatter = new Vex.Flow.Formatter().joinVoices([ voice ]);
            var stave = new Vex.Flow.Stave(0, 0, MAX_WIDTH);
            if (bar.modifiers.begin) {
                stave.setBegBarType(SS.Bar.getBegin(bar.modifiers.begin));
            }
            if (bar.modifiers.end) {
                stave.setEndBarType(SS.Bar.getEnd(bar.modifiers.end));
            }
            
            // Add time signature if necessary
            var prev = row.items.length && row.items[row.items.length - 1];
            if (!prev || prev.bar.timeSig.vexFormat() !== bar.timeSig.vexFormat()) {
                stave.addTimeSignature(bar.timeSig.vexFormat());
            }
            
            var keySig = undefined;
            function addKeySig() {
                keySig = new Vex.Flow.KeySignature(bar.keySig);
                if (prev) {
                    keySig.cancelKey(prev.bar.keySig);
                }
                stave.addModifier(keySig);
            }
            if (!prev || prev.bar.keySig !== bar.keySig) {
                addKeySig();
            }
            
            // Calculate initial widths
            var voiceWidth = formatter.preCalculateMinTotalWidth([ voice ]) * BAR_SCALE;
            var stavePadding = getStavePadding(stave);
            function totalWidth() {
                return voiceWidth + stavePadding;
            }

            // New Row
            if (!prev || (row.left + totalWidth()) > MAX_WIDTH) {
                drawRow(row);
                stave.addClef(clef);
                if (!keySig) {
                    addKeySig();
                }
                row.top = (prev && prev.stave.getBottomY()) || 0;
                row.left = 0;
                stavePadding = getStavePadding(stave);
                row.items = [];
            }
            stave.setX(row.left).setY(row.top).setWidth(totalWidth());
            
            row.items.push({ bar : bar, stave : stave, voice : voice, beams : beams, formatter : formatter });
            row.left += totalWidth();
        });
        drawRow(row);
        renderer.resize(WIDTH, row.items[0].stave.getBottomY());
    }
    
    return {
        restrict : 'E',
        link : link
    };
} ])
.directive('ssMusicScore', [ function() {
    
    function link(scope, element, attrs) {
        
    }
    
    return {
        restrict : 'E',
        link : link,
        template : 
            `<md-card flex="none" layout="column" layout-align="start center">
                <md-card-content flex layout="column" layout-align="start center">
                    <ss-vex-flow flex layout="column" layout-align="start center"></ss-vex-flow>
                </md-card-content>
            </md-card>`
    };
} ]);