angular.module('score-stage')
.directive('ssScoreRow', [ 'timeWatcher', function(timeWatcher) {
    
    function getBeginBarline(stave) {
        return stave.getModifiers(Vex.Flow.StaveModifier.Position.BEGIN, 'barlines')[0];
    }
    
    function link(scope, element, attrs) {
        
        var renderer = new Vex.Flow.Renderer(element[0], Vex.Flow.Renderer.Backends.SVG);
        var context = renderer.getContext();
        
        function render() {
            element.children().empty();
            if (!scope.viewWidth || !scope.maxWidth || !scope.barScale || !scope.row) {
                return;
            }
            
            var prev = undefined;
            var height = 0;
            scope.row.measures.forEach(function(measure) {
                measure.width = (measure.widthNoPadding() / scope.row.widthNoPadding()) * (scope.maxWidth - scope.row.totalPadding()) + measure.totalPadding();
                measure.x = (prev && (prev.x + prev.width)) || measure.x;
                measure.formatter.format(measure.voices, measure.widthNoPadding());

                var y = 0;
                var barlineX = measure.x;
                measure.staves.forEach(function(stave) {
                    stave.setX(measure.x).setY(y).setWidth(measure.width).setNoteStartX(measure.x + measure.padding.left);
                    y += stave.getBottomY() - stave.y;
                    barlineX = Math.max(barlineX, getBeginBarline(stave).getX());
                });
                measure.staves.forEach(function(stave) {
                    getBeginBarline(stave).setX(barlineX);
                    stave.setContext(context).draw();
                });
                
                measure.voices.forEach(function(voice, index) {
                    voice.draw(context, measure.staves[index]);
                });
                measure.beams.forEach(function(beam) {
                    beam.setContext(context).draw();
                });
                
                var start = 0;
                scope.groups.forEach(function(group, index) {
                    var end = index === (scope.groups.length - 1) ? measure.staves.length : start + group.count;
                    
                    if (start < end - 1) {
                        var first = measure.staves[start];
                        var last = measure.staves[end - 1];
                        var connector = measure.vexEndLarge();
                        new Vex.Flow.StaveConnector(first, last).setType(connector).setContext(context).draw();
                        
                        connector = measure.vexBeginLarge();
                        var shift = barlineX - measure.x;
                        if ((!connector || shift !== 0) && prev) {
                            new Vex.Flow.StaveConnector(first, last).setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
                        }
                        if (connector) {
                            new Vex.Flow.StaveConnector(first, last).setType(connector).setContext(context).setXShift(shift).draw();
                        }
                    }
                    
                    start = end;
                });
                if (!prev) {
                    new Vex.Flow.StaveConnector(measure.staves[0], measure.staves[measure.staves.length - 1]).setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT)
                        .setContext(context).draw();
                }
                
                prev = measure;
                height = Math.max(height, y);
            });
            scope.row.width = scope.maxWidth;
            renderer.resize(scope.viewWidth, height);
        }
        render();
        scope.$on('$destroy', function() {
            scope.row.offRender();
        });
        scope.row.onRender(render);
    }
    
    return {
        restrict : 'E',
        link : link,
        scope : {
            row : '<',
            groups : '<',
            viewWidth : '<',
            maxWidth : '<',
            barScale : '<'
        }
    };
} ])
.directive('ssScore', [ 'timeWatcher', function(timeWatcher) {
    
    function Row() {
        this.measures = [];
        this.width = 0;
        this.padding = { left : 0, right: 0 };
        this._queued = false;
    }
    Row.prototype.addMeasure = function(measure) {
        this.measures.push(measure);
        measure.x = this.width;
        this.width += measure.width;
        this.padding.left += measure.padding.left;
        this.padding.right += measure.padding.right;
    };
    Row.prototype.widthNoPadding = function() {
        return this.width - this.totalPadding();
    };
    Row.prototype.totalPadding = function() {
        return this.padding.left + this.padding.right;
    };

    function link(scope, element, attrs) {

        Row.prototype.onRender = function(handler) {
            this.renderHandler = handler;
        };
        Row.prototype.offRender = function() {
            this.renderHandler = undefined;
        };
        Row.prototype.render = function() {
            var self = this;
            if (!self.renderHandler || self.queued) {
                return;
            }
            
            self._queued = true;
            scope.$applyAsync(function() {
                if (self.renderHandler) {
                    self.renderHandler();
                }
                self._queued = false;
            });
        };

        scope.rows = undefined;
        scope.width = undefined;
        scope.maxWidth = undefined;
        scope.barScale = scope.barScale || undefined;
        
        function getPrev(measure, index) {
            return measure && measure.bars[index];
        }
        
        var queued = false;
        function createRows() {
            if (queued) {
                return;
            }
            queued = true;
            
            scope.$applyAsync(function() {
                if (scope.width && scope.maxWidth && scope.barScale && scope.measures) {
                    
                    scope.rows = [];
                    var prevMeasure = undefined;
                    scope.measures.forEach(function(measure, mIndex) {
                        measure.reset();
                        measure.bars.forEach(function(bar, bIndex) {
                            var prev = getPrev(prevMeasure, bIndex);
                            
                            // ** CREATE VOICE ** //
                            
                            var notes = bar.ticks.map(function(tick) {
                                var keys = tick.notes.map(function(note) {
                                    return note.letter + note.accidental + '/' + note.octave;
                                });
                                var duration = tick.duration + '';
                                if (tick.isRest()) {
                                    keys = [ 'r/4' ];
                                    duration += 'r';
                                }
                                return new Vex.Flow.StaveNote({ clef : bar.clef, keys : keys, duration : duration, auto_stem: true });
                            });
                            // Connect notes
                            Vex.Flow.Beam.generateBeams(notes).forEach(function(beam) { 
                                measure.beams.push(beam);
                            });
                            var voice = new Vex.Flow.Voice({ beat_value : measure.timeSig.upper, num_beats : measure.timeSig.lower }).setStrict(false).addTickables(notes);
                            // Display correct accidentals
                            Vex.Flow.Accidental.applyAccidentals([ voice ], bar.keySig);
                            measure.voices.push(voice);
                            
                            // ** CREATE STAVE ** //
                            
                            var stave = new Vex.Flow.Stave(0, 0, scope.maxWidth);
                            // Set bar begin
                            var modifier = measure.vexBegin();
                            if (modifier) {
                                stave.setBegBarType(modifier);
                            }
                            // Set bar end
                            modifier = measure.vexEnd();
                            if (modifier) {
                                stave.setEndBarType(modifier);
                            }
                            // Add time signature if necessary
                            if (!prevMeasure || prevMeasure.timeSig.vexFormat !== measure.timeSig.vexFormat) {
                                stave.addTimeSignature(measure.timeSig.vexFormat);
                            }
                            // Add key signature if necessary
                            if (!prev || prev.keySig !== bar.keySig) {
                                stave.setKeySignature(bar.keySig, prev && prev.keySig);
                            }
                            // Add clef
                            stave.clef = bar.clef;
                            if (!prev || prev.clef !== bar.clef) {
                                stave.setClef(bar.clef);
                            }
                            measure.addStave(stave);
                        });
                        measure.joinVoices(scope.barScale);
                        var row = scope.rows.length && scope.rows[scope.rows.length - 1];
                        
                        // New Row
                        if (!row || (row.width + measure.width) > scope.maxWidth) {
                            if (row) {
                                row.render();
                            }
                            row = new Row();
                            scope.rows.push(row);
                            measure.bars.forEach(function(bar, bIndex) {
                                var prev = getPrev(prevMeasure, bIndex);
                                var cancelKey = prev && prev.keySig !== bar.keySig && prev.keySig;
                                measure.staves[bIndex].setClef(bar.clef).setKeySignature(bar.keySig, cancelKey);
                                measure.updatePadding(bIndex);
                            });
                        }
                        row.addMeasure(measure);
                        prevMeasure = measure;
                    });
                }
                queued = false;
            });
        }
        
        timeWatcher(scope, function() {
            return element[0].offsetWidth;
        }, function(newValue, oldValue) {
            scope.width = newValue;
            scope.maxWidth = newValue - 1;
            createRows();
        });
        
        scope.$watch('barScale', function(newValue, oldValue) {
            scope.barScale = newValue;
            createRows();
        });
        
        scope.$watch('measures', function() {
            createRows();
        });
    }
    
    return {
        restrict : 'E',
        link : link,
        scope : {
            measures : '<',
            groups : '<',
            barScale : '<'
        },
        template :
            `<div layout="column">
                <ss-score-row ng-repeat="row in rows" row="row" groups="groups" view-width="width" max-width="maxWidth" bar-scale="barScale"></ss-score-row>
            </div>`
    }
} ])
.directive('ssMusicScore', [ function() {
    
    function link(scope, element, attrs) {
        
        scope.measures = [
            new SS.Measure(new SS.TimeSignature(3,4), [], { begin : 'REPEAT' }),
            new SS.Measure(new SS.TimeSignature(3,4), [], { end : 'REPEAT' }),
            new SS.Measure(new SS.TimeSignature(3,4), [], { begin : 'REPEAT' }),
            new SS.Measure(new SS.TimeSignature(5,8), []),
            new SS.Measure(new SS.TimeSignature(5,8), []),
            new SS.Measure(new SS.TimeSignature(6,8), []),
            new SS.Measure(new SS.TimeSignature(6,8), [], { end : 'REPEAT' }),
            new SS.Measure(new SS.TimeSignature(6,8), [], { begin : 'REPEAT', end : 'REPEAT' }),
            new SS.Measure(new SS.TimeSignature(3,4), []),
            new SS.Measure(new SS.TimeSignature(2,2), []),
            new SS.Measure(new SS.TimeSignature(4,4), []),
            new SS.Measure(new SS.TimeSignature(4,4), [], { end : 'END' })
        ].map(function(measure) {
            
            var ticks = [
                new SS.Tick(8, [ new SS.Note('a', 3, 'n') ]),
                new SS.Tick(8, [ new SS.Note('b', 3, '#') ]),
                new SS.Tick(2, []),
                new SS.Tick(4, []),
                new SS.Tick(2, [ new SS.Note('a', 3, 'n'), new SS.Note('c', 4, 'n'), new SS.Note('e', 4, 'b') ])
            ];
            
            var bars = [
                new SS.Bar('treble', 'C', ticks),
                new SS.Bar('bass', 'Eb', ticks),
                new SS.Bar('treble', 'Cb', ticks),
                new SS.Bar('treble', 'E', ticks),
                new SS.Bar('bass', 'Db', ticks),
                new SS.Bar('bass', 'C#', ticks)
            ]
            measure.bars = bars;
            return measure;
        });
        
        scope.groups = [
            new SS.Group('Clarinet', 'Clt', 2),
            new SS.Group('Trumpet', 'Tpt', 1),
            new SS.Group('Flute', 'Flt', 3)
        ];
    } 
    
    return {
        restrict : 'E',
        link : link,
        template : 
            `<md-card>
                <md-card-content layout="column">
                    <ss-score measures="measures" groups="groups" bar-scale="2"></ss-score>
                </md-card-content>
            </md-card>`
    };
} ]);