angular.module('score-stage')
.directive('ssVexFlow', [ function() {
    
    var WIDTH = 1000;
    
    function link(scope, element, attrs) {
        
        var renderer = new Vex.Flow.Renderer(element[0], Vex.Flow.Renderer.Backends.SVG);
        var context = renderer.getContext();
        
        var stave = new Vex.Flow.Stave(0, 0, WIDTH - 1);
        stave.addClef("treble").addTimeSignature("4/4");
        stave.setContext(context).draw();
        
        var stave2 = new Vex.Flow.Stave(0, stave.getBottomY(), WIDTH - 1);
        stave2.addClef("treble").addTimeSignature("4/4");
        stave2.setContext(context).draw();
        
        renderer.resize(WIDTH, stave2.getBottomY());
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