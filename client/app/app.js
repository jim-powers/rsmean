'use strict';

angular.module('rsmeanApp', [
  'ngCookies',
  'ngMessages',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ui.grid', 'ui.grid.pinning', 'ui.grid.resizeColumns', 'ui.grid.grouping', 'ui.grid.treeView',
  's44.styleguide.flash',
  's44.styleguide.util',
  's44.styleguide.form'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);

    $stateProvider
      .state('app', {
        'abstract': true,
        data: {
          roles: []
        },
        views: {
          'flash@': {
            templateUrl: 'bower_components/s44-styleguide/client/components/flash/flash.html',
            controller: 'FlashController'
          },
          'navbar@': {
            templateUrl: 'bower_components/s44-styleguide/client/components/layout/navbar/navbar.html'
          },
          'navbar-left@app': {
            templateUrl: 'app/nav.html'
          },
          'footer@': {
            templateUrl: 'bower_components/s44-styleguide/client/components/layout/footer/footer.html'
          },
          'login-form@': {
            templateUrl: 'bower_components/s44-styleguide/client/components/login/form.html'
          }
        }
      })
      .state('error', {
        parent: 'app',
        abstract: true
      })
      .state('404', {
        parent: 'error',
        url: '/404',
        views: {
          'content@': {
            templateUrl: 'components/error/404.html'
          }
        }
      })
    ;
  });
