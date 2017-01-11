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
                
                <md-content style="overflow-y: scroll;" flex layout="column" layout-gt-md="row" layout-align-gt-md="center start">
                    <ss-music-score flex-gt-md="66" style="max-height: inherit;" class="md-margin"></ss-music-score>
                </md-content>
            </div>`
    };
} ]);