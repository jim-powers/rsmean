(function() {
  /* globals Big: false */
  /* jshint -W064 */
  'use strict';

  angular.module('rsmeanApp')
    .factory('ProductsUtil', function() {

      return {
        // Normal javascript Number object results in rounding errors, try adding 6 kg, 3 g and 3 mg.
        // The display value in kg comes out as: 6.0030030000000005
        // Uses big.js but if you ng-bind="productWt()", angularjs watches this function and gets all tweaked by $digest cycles
        // wtUnits is 1 (mg), 1000 (g), or 1000000 (kg)
        computeWt : function(substances, wtUnits) {
          try {
            var wt = _.reduce(substances, function(previousValue, currentValue) {
              if (currentValue.wt && currentValue.wtUnits) {
                var n = Big(currentValue.wt);
                var nUnits = Big(currentValue.wtUnits);
                if (!isNaN(n) && !isNaN(nUnits)) {
                  var n1 = (n.times(nUnits)).div(Big(wtUnits));
                  return previousValue.plus(n1);
                } else {
                  return previousValue;
                }
              } else {
                return previousValue;
              }
            }, Big(0));
            return wt;
          } catch (e) {
          }
          return Big(0);
        }
      };
    });
})();
