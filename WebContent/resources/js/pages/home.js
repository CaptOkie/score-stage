angular.module('score-stage')
.directive('ssHome', [ function() {
    
    function link(scope, element, attrs) {
        
    }
    
    return {
        restrict : 'E',
        link : link,
        template : 
            `<div layout="column" flex>
                <md-toolbar flex="none" md-whiteframe="4">
                    <div class="md-toolbar-tools">
                        <h1>Home</h1>
                    </div>
                </md-toolbar>
                
                <md-content flex layout="column" layout-align="start center">
                    <ss-music-score flex="none" class="md-margin" layout="column" layout-align="start center"></ss-music-score>
                </md-content>
            </div>`
    };
} ]);