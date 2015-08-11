(function() {
  /* jshint -W064 */
  'use strict';

  angular.module('rsmeanApp')
    .factory('ProductsStore', function($http, ProductsUtil) {

      var productsApiUrl = 'api/v1/products';

      return {
        deserializeProduct: function(product) {
          product.wt = ProductsUtil.computeWt(product.substances, 1).toString();
        },
        // Add the weight to each product
        deserialize: function(data) {
          var self = this;
          angular.forEach(data, function(value) {
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
              //$scope.product.substances = $scope.product.substances || [];
              //var treeData = getTreeData($scope.product.substances);
              //$scope.gridOptions2.data = treeData; //$scope.product.substances;
            });
        },
        createRecord: function(data) {
          delete data._id; // if they happen to have a mongo _id present, delete it
          return $http.post(productsApiUrl, data)
            .success(function(data/*, status, headers, config*/) {
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
      //return ProductsStore;
    });
})();
