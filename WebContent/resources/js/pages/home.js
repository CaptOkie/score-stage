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
                
                <md-content style="overflow-y: scroll;" flex="none" flex-gt-sm="100" layout="row" layout-align="center start">
                    <ss-music-score flex="100" flex-gt-sm="66" class="md-margin"></ss-music-score>
                </md-content>
            </div>`
    };
} ]);