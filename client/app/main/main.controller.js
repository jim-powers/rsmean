'use strict';

angular.module('rsmeanApp')
  .controller('MainCtrl', function ($scope, $http) {
    var todoApiUrl = 'api/v1/todo';
    $scope.todoItems = [ ];
    $http.get(todoApiUrl)
      .success(function(data/*, status, headers, config*/) {
        $scope.todoItems = [
          {title : 'Add products', isComplete : false },
          {title : 'Match customer products', isComplete : false }
        ];
      });
  });
