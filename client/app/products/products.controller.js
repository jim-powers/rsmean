(function() {
  'use strict';

  angular.module('rsmeanApp')
    .controller('ProductsCtrl', function($scope, $state, $http, uiGridConstants, flashService, $modal,
      ProductsStore, ProductModalService) {
      document.title = 'Source Intelligence&reg; - ' + $state.current.name;
      $scope.ps = ProductsStore; // new ProductsStore();
      $scope.loadProducts = function() {
        $scope.ps.findAll()
          .success(function(data/*, status, headers, config*/) {
            console.log('Controller returned something');
            $scope.gridOptions.data = data; // prepareDataForGrid(data);
          });
      };
      $scope.loadProducts();

      $scope.createProduct = function() {
        var modalInstance = ProductModalService.open({
          modalTitle : function() {
            return 'Create Product';
          },
          product    : function() {
            return {name : '', id : ''}; // These are the only 2 pre-defined product fields
          }
        });
        modalInstance.result.then(function(selectedItem) {
          $scope.selected = selectedItem;
          $scope.ps.createRecord(selectedItem.product)
            .success(function(/*data, status, headers, config*/) {
              flashService.push({template : 'Product created', level : 'success'});
              $scope.loadProducts();
            });
        }, function() {
          //console.log('Modal dismissed at: ' + new Date());
        });
      };
      $scope.editProduct = function(row) {
        var modalInstance = ProductModalService.open({
          modalTitle : function() {
            return 'Edit Product';
          },
          product    : function() {
            return row.entity;
          }
        });
        modalInstance.result.then(function(selectedItem) {
          $scope.ps.updateRecord(selectedItem.product)
            .success(function(/*data, status, headers, config*/) {
              flashService.push({template : 'Product updated', level : 'success'});
              $scope.loadProducts();
            });
        }, function() {
          //console.log('Modal dismissed at: ' + new Date());
        });
      };
      $scope.deleteProduct = function(row) {
        var rowId = row.entity._id;
        if (rowId) {
          $scope.ps.deleteRecord(rowId)
            .success(function(/*data, status, headers, config*/) {
              flashService.push({template : 'Product deleted', level : 'success'});
              $scope.loadProducts();
            });
        }
      };
      $scope.duplicateProduct = function(row) {
        var newProduct = angular.copy(row.entity);
        newProduct.name = 'Copy of ' + newProduct.name;
        delete newProduct._id;
        var modalInstance = ProductModalService.open({
          modalTitle : function() {
            return 'Edit Product';
          },
          product    : function() {
            return newProduct;
          }
        });
        modalInstance.result.then(function(selectedItem) {
          $scope.ps.createRecord(selectedItem.product)
            .success(function(/*data, status, headers, config*/) {
              flashService.push({template : 'Product created', level : 'success'});
              $scope.loadProducts();
            });
        }, function() {
          //console.log('Modal dismissed at: ' + new Date());
        });
      };

      $scope.gridOptions = {
        enableSorting        : true,
        enableColumnMenus    : false,
        enableColumnResizing : true,
        onRegisterApi        : function(gridApi) {
          $scope.grid2Api = gridApi;
        },
        columnDefs           : [
          {
            displayName  : '',
            field        : 'isFmdComplete',
            sort         : {
              priority : 1
            },
            width        : 30,
            cellTemplate : '<div class="ui-grid-cell-contents"><i ng-class="{\'icon-complete\': row.entity.isFmdComplete, \'icon-incomplete\': !row.entity.isFmdComplete }"></i></div>'
          },
          {
            name         : 'Actions',
            field        : 'actions',
            width        : 90,
            pinnedRight  : true,
            cellTemplate : '<div class="ui-grid-cell-contents button-cell"><i class="fa fa-edit" style="margin: 0 5px;" ng-click="grid.appScope.editProduct(row)" ></i><i class="fa fa-copy" style="margin: 0 5px;" ng-click="grid.appScope.duplicateProduct(row)" ></i><i class="fa fa-remove" style="margin: 0 5px;" ng-click="grid.appScope.deleteProduct(row)"></i></div>'
          },

          {
            displayName  : 'Product Name',
            field        : 'name',
            sort         : {
              priority : 1
            },
            cellTemplate : '<div class="ui-grid-cell-contents"><a ui-sref="app.product({id: row.entity._id})">{{row.entity.name}}</a></div>',
            width: 200
          },
          {
            displayName : 'Product Id',
            field       : 'id',
            sort        : {
              priority : 1
            }
          }
        ]
      };
      $scope.gridOptions.data = [];
    });

})();
