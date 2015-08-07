(function() {
  'use strict';

  angular.module('rsmeanApp')
    .factory('ProductsStore', ['$http', function($http) {

      function ProductsStore(data) {
      }

      var productsApiUrl = 'api/v1/products';
      var displayWtUnits = 1;

      ProductsStore.prototype = {
        // Normal javascript Number object results in rounding errors, try 6 kg, 3 g and 3 mg for the 3 substance weight
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
        },
        deserializeProduct: function(product) {
          product.wt = this.computeWt(product.substances, displayWtUnits).toString();
        },
        // Add the weight to each product
        deserialize: function(data) {
          var self = this;
          angular.forEach(data, function(value, index) {
            self.deserializeProduct(value);
          });
        },
        findAll: function() {
          var self = this;
          return $http.get(productsApiUrl)
            .success(function(data/*, status, headers, config*/) {
              self.deserialize(data);
              console.log('ProductsStore returned something');
            });
        },
        find : function(id) {
          var self = this;
          var url = productsApiUrl + '/' + id;
          return $http.get(url)
            .success(function(data/*, status, headers, config*/) {
              self.deserializeProduct(data[0]);
              //$scope.product = data[0];
              //$scope.product.wt = $scope.productWt();
              //$scope.productName = $scope.product.name;
              //$scope.product.substances = $scope.product.substances || [];
              //var treeData = getTreeData($scope.product.substances);
              //$scope.gridOptions2.data = treeData; //$scope.product.substances;
            });
        },
        createRecord: function(data) {
          delete data._id; // if they happen to have a mongo _id present, delete it
          return $http.post(productsApiUrl, data)
            .success(function(/*data, status, headers, config*/) {
              console.log('created record', data[0].id);
            });
        },
        updateRecord: function(data) {
          return $http.put(productsApiUrl + '/' + data._id, data)
            .success(function(/*data, status, headers, config*/) {
              console.log('updated record', data[0].id);
            });
        },
        deleteRecord: function(id) {
          return $http.delete(productsApiUrl + '/' + id)
              .success(function(/*data, status, headers, config*/) {
              console.log('deleted record', id);
            });
        }
      };
      return ProductsStore;
    }]);
})();
