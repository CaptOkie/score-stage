angular.module('score-stage')
.factory('timeWatcher', [ '$timeout', function($timeout) {
    
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
            $timeout(watch, 100, false);
        }
        $timeout(watch, 100, false);
        function cancel() {
            cancelled = true;
        }
        scope.$on('$destroy', cancel);
        return cancel;
    };
} ]);