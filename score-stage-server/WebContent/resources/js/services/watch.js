angular.module('score-stage')
.factory('watcher', [ '$timeout', function($timeout) {
    
    return function(scope, func, callback) {
        var value = undefined;
        var cancelled = false;
        function watch() {
            if (cancelled) {
                return;
            }
            
            var newValue = func();
            if (!angular.equals(value, newValue)) {
                callback(newValue, value);
                value = newValue;
                scope.$apply();
            }
            requestAnimationFrame(watch);
        }
        function cancel() {
            cancelled = true;
        }
        scope.$on('$destroy', cancel);
        requestAnimationFrame(watch);
        return cancel;
    };
} ]);