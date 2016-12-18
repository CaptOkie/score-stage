angular.module('score-stage')
.directive('ssVexFlow', [ function() {
    
    var WIDTH = 1000;
    var MAX_WIDTH = WIDTH - 1;
    
    function link(scope, element, attrs) {
        
        var bars = [0,0,0,0,0,0].fill(new SS.Bar(new SS.TimeSignature(3, 4), [ new SS.Tick('q', [ new SS.Note('a', 4) ]), new SS.Tick('q', [ new SS.Note('b', 4) ]),
            new SS.Tick('q', []), new SS.Tick('q', []), new SS.Tick('q', [ new SS.Note('c', 5), new SS.Note('d', 5), new SS.Note('e', 5) ]) ]));
        
        var renderer = new Vex.Flow.Renderer(element[0], Vex.Flow.Renderer.Backends.SVG);
        var context = renderer.getContext();
        
        var prev = undefined;
        // Most recent top, bottom, and left, and total width
        var row = { top : 0, left : 0, width : 0 };
        bars.forEach(function(bar) {
            
            var clef = 'treble';
            // Create the notes
            var notes = bar.ticks.map(function(tick) {
                var keys = tick.notes.map(function(note) {
                    return note.letter + '/' + note.octave;
                });
                var duration = tick.duration;
                if (tick.isRest()) {
                    keys = [ 'b/4' ];
                    duration += 'r';
                }
                return new Vex.Flow.StaveNote({ clef : clef, keys : keys, duration : duration });
            });
            var voice = new Vex.Flow.Voice({ beat_value : bar.time.upper, num_beats : bar.time.lower })
            voice.setStrict(false).addTickables(notes);
            
            var width = new Vex.Flow.Formatter().joinVoices([ voice ]).format([ voice ]).getMinTotalWidth();
            var newRow = (row.width + width) > MAX_WIDTH;
            if (newRow) {
                row.top = (prev && prev.getBottomY()) || 0;
                row.left = 0;
                row.width = width;
            }
            else {
                row.left = row.width;
                row.width += width;
            }
            
            var stave = new Vex.Flow.Stave(row.left, row.top, width);
            if (newRow) {
                stave.addClef(clef);
            }
            else if (!prev) {
                stave.addClef(clef);
                stave.addTimeSignature(bar.time.vexFormat());
            }
            var extraWidth = stave.getModifiers().reduce(function(prev, curr) {
                return prev + curr.getWidth() + curr.getPadding();
            }, 0);
            width += extraWidth;
            row.width += extraWidth;
            stave.setWidth(width);
            stave.setContext(context).draw();
            voice.draw(context, stave);
            prev = stave;
        });
        
        renderer.resize(WIDTH, prev.getBottomY());
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