'use strict';

angular.module('rsmeanApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        parent: 'app',
        url: '/',
        views: {
          'content@': {
            templateUrl : 'app/main/main.html',
            controller  : 'MainCtrl'
          }
        }
      });
  });
