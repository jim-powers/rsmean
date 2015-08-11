(function() {
  'use strict';

  /**
   * @ngInject
   * @constructor
   */
  function ProductModalInstanceCtrl($scope, $modalInstance, modalTitle, product) {
    $scope.modalTitle = modalTitle;
    $scope.product = product;
    $scope.model = product;
    $scope.metaInfo = {
      name: { type: 'text', required: true, placeholder: 'Enter the product name'},
      id: { type: 'text', required: false, placeholder: 'Enter the product id'}
    };
    $scope.filterMetaInfo = function(obj) {
      return $scope.metaInfo[obj];
    };
    $scope.selected = {
      product : $scope.product
    };

    $scope.ok = function() {
      $modalInstance.close($scope.selected);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }
  angular.module('rsmeanApp').controller('ProductModalInstanceCtrl', ProductModalInstanceCtrl);

  angular.module('rsmeanApp').filter('capitalize', function() {
    return function(input) {
      return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
    };
  });

  angular.module('rsmeanApp').service('ProductModalService', ['$http', '$modal', function($http, $modal) {

    this.open = function(resolve) {
      var modalInstance = $modal.open({
        animation   : false,
        templateUrl : 'productModal.html',
        controller  : 'ProductModalInstanceCtrl',
        size: 'product',
        resolve     : resolve
      });
      return modalInstance;
    };
  }]);
})();
