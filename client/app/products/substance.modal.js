(function() {
  'use strict';

  /**
   * @ngInject
   * @constructor
   */
  function ProductSubstanceModalInstanceCtrl($scope, $http, $modalInstance, modalTitle, substance, getComponents, columns, substanceUnitsMetaInfo, onContinue) {
    $scope.modalTitle = modalTitle;
    $scope.substance = substance;
    $scope.columns = columns;
    $scope.model = substance;
    $scope.onContinue = onContinue;
    $scope.substanceUnitsMetaInfo = substanceUnitsMetaInfo;
    $scope.components = getComponents();
    $scope.mySelectedSubstance = substance;
    $scope.getSubstances = function(val) {
      return $http.get('/api/v1/substances?q=' + val)
        .then(function(response) {
          var found = _.map(response.data.results, function(item) {
            item.search = val;
            return item;
          });
          return found;
        });
    };

    $scope.onSelect = function(item, model, label) {
      _.assign($scope.mySelectedSubstance, model);
      $scope.mySelectedSubstance.search = label;
    };

    $scope.selected = {
      substance           : $scope.substance,
      mySelectedSubstance : $scope.mySelectedSubstance
    };

    $scope.continue = function() {
      if ($scope.onContinue) {
        $scope.onContinue($scope.mySelectedSubstance);
      }
      delete $scope.mySelectedSubstance;
      $scope.components = getComponents(); // re-calc components
      $scope.userForm.$setPristine();
      // clear these hard-coded fields -- substance is narrowly defined (at the moment)
      _.each(['cas', 'name', 'wt'], function(element) {
        $scope.userForm[element] = '';
      });
      var searchEl = document.forms.userForm.querySelector('input[name="searchSubstance"]');
      if (searchEl) {
        searchEl.focus();
      }
    };

    $scope.ok = function() {
      $modalInstance.close($scope.mySelectedSubstance);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }

  angular.module('rsmeanApp').controller('ProductSubstanceModalInstanceCtrl', ProductSubstanceModalInstanceCtrl);

  angular.module('rsmeanApp').service('ProductSubstanceModalService', ['$http', '$modal', function($http, $modal) {

    this.open = function(resolve) {

      var modalInstance = $modal.open({
        animation   : false,
        templateUrl : 'substanceModal.html',
        controller  : 'ProductSubstanceModalInstanceCtrl',
        size        : 'substance',
        resolve     : resolve
      });
      return modalInstance;
    };
  }]);
})();
