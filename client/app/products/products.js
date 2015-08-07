(function() {
  'use strict';

  angular.module('rsmeanApp')
    .config(function($stateProvider) {
      $stateProvider
        .state('app.products', {
          parent : 'app',
          url    : '/products',
          views  : {
            'content@'        : {
              templateUrl : 'app/products/products.html',
              controller  : 'ProductsCtrl'
            },
            'productModal@app.products' : {
              templateUrl : 'app/products/product.modal.html'
            }
          }
        })
        .state('app.product', {
          parent: 'app',
          url: '/products/:id',
          views: {
            'content@' : {
              templateUrl: 'app/products/product.html',
              controller: 'ProductCtrl'
            },
            'substanceModal@app.product' : {
              templateUrl : 'app/products/substance.modal.html'
            }
          }
        });
    });

})();
