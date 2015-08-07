(function() {
  /* globals Big: false */
  /* jshint -W064 */
  'use strict';

  angular.module('rsmeanApp')
    .filter('capitalize', function() {
      return function(input) {
        return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
      };
    })
   .controller('ProductsCtrl', function($scope, $state, $http, uiGridConstants, flashService, $modal, ProductsStore) {
      document.title = 'Source Intelligence&reg; - ' + $state.current.name;
      $scope.ps = new ProductsStore();
      $scope.loadProducts = function() {
        $scope.ps.findAll()
          .success(function(data/*, status, headers, config*/) {
            console.log('Controller returned something');
            $scope.gridOptions.data = data; // prepareDataForGrid(data);
          });
      };
      $scope.loadProducts();
      // Some initial columns for a product, typically this would be in some model
      $scope.columns = [
        {
          id          : 'name',
          displayName : 'Product Name',
          width       : '200px',
          visible     : true,
          placeholder : 'Enter Product name'
        },
        {id : 'productId', displayName : 'Product Id', width : '100px', visible : true},
        {id : 'color', displayName : 'Color', width : '75px', visible : true},
        {id : 'style', displayName : 'Style', width : '50px', visible : false}
      ];
      // CRUD operations for a product
      $scope.createProduct = function() {
        var modalInstance = $modal.open({
          animation   : $scope.animationsEnabled,
          templateUrl : 'productModal.html',
          controller  : 'ProductModalInstanceCtrl',
          size: 'product',
          resolve     : {
            modalTitle : function() {
              return 'Create Product';
            },
            columns    : function() {
              return $scope.columns;
            },
            product    : function() {
              return {name : '', id: ''};
            }
          }
        });
        modalInstance.result.then(function(selectedItem) {
          $scope.selected = selectedItem;
          $scope.ps.updateRecord(selectedItem.product)
            .success(function(/*data, status, headers, config*/) {
              flashService.push({template : 'Product created', level : 'success'});
              $scope.loadProducts();
            });
        }, function() {
          //console.log('Modal dismissed at: ' + new Date());
        });
      };
      $scope.editProduct = function(row, size) {
        var modalInstance = $modal.open({
          animation   : $scope.animationsEnabled,
          templateUrl : 'productModal.html',
          controller  : 'ProductModalInstanceCtrl',
          size        : size,
          resolve     : {
            modalTitle : function() {
              return 'Edit Product';
            },
            columns    : function() {
              return $scope.columns;
            },
            product    : function() {
              return row.entity;
            }
          }
        });
        modalInstance.result.then(function(selectedItem) {
          $scope.selected = selectedItem;
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
      $scope.displayWtUnits = 1;
      $scope._productWt = function(product) {
        try {
          var wt = _.reduce(product.substances, function(previousValue, currentValue) {
            if (currentValue.wt && currentValue.wtUnits) {
              var n = Big(currentValue.wt);
              var nUnits = Big(currentValue.wtUnits);
              if (!isNaN(n) && !isNaN(nUnits)) {
                var n1 = (n.times(nUnits)).div(Big($scope.displayWtUnits));
                return previousValue.plus(n1);
              } else {
                return previousValue;
              }
            } else {
              return previousValue;
            }
          }, Big(0));
          return wt;
        } catch(e) {
          return Big(0);
        }
      };
      $scope.displayProductWt = function(product) {
        return $scope._productWt(product).toString();
      };

      /*jshint multistr: true */
      function rowTemplate() {
        var template =
          '<div data-row-id="row-{{row.entity.myNumber}}" ng-class="{ \'my-css-class\': !row.entity.myNumber}" ng-style="{ height: row.entity.myNumber ? \'100px\' : \'300px\'}"> \
            <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" \
                  class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader}">\
                  <div ui-grid-cell></div>\
            </div> \
          </div>';
        return template;
      }

      $scope.gridOptions = {
        enableSorting     : true,
        enableColumnMenus : false,
        enableColumnResizing: true,
        onRegisterApi     : function(gridApi) {
          $scope.grid2Api = gridApi;
        },
        // rowTemplate       : rowTemplate(),
        columnDefs        : [
          {
            displayName: '',
            field: 'isFmdComplete',
            sort: {
              priority: 1
            },
            width: 30,
            cellTemplate : '<div class="ui-grid-cell-contents"><i ng-class="{\'icon-complete\': row.entity.isFmdComplete, \'icon-incomplete\': !row.entity.isFmdComplete }"></i></div>'
          },
          {
            name         : 'Actions',
            field        : 'actions',
            width        : 70,
            pinnedRight  : true,
            cellTemplate : '<div class="ui-grid-cell-contents button-cell"><i class="fa fa-edit" style="margin: 0 5px;" ng-click="grid.appScope.editProduct(row)" ></i><i class="fa fa-remove" style="margin: 0 5px;" ng-click="grid.appScope.deleteProduct(row)"></i></div>'
          },

          {
            displayName  : 'Product Name',
            field        : 'name',
            sort         : {
              priority : 1
            },
            cellTemplate : '<div class="ui-grid-cell-contents"><a ui-sref="app.product({id: row.entity._id})">{{row.entity.name}}</a></div>',
            width        : 200
          },
          {
            displayName  : 'Product Id',
            field : 'productId',
            sort  : {
              priority : 1
            }
            //width : 100
          },
          {
            displayName: 'WT',
            field: 'wt',
            cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.wt}}</div>'
          },
          {
            displayName: 'Weight',
            field: 'wt',
            cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.displayProductWt(row.entity)}}</div>'
          }
          //{
          //  field : 'color',
          //  sort  : {
          //    direction : uiGridConstants.ASC,
          //    priority  : 1
          //  }
          //}
        ]
      };
      $scope.gridOptions.data = [];
    });


  /**
   * @ngInject
   * @constructor
   */
  function ProductModalInstanceCtrl($scope, $modalInstance, modalTitle, product, columns) {
    $scope.modalTitle = modalTitle;
    $scope.product = product;
    $scope.columns = columns;
    $scope.model = product;
    $scope.metaInfo = {
      name: { type: 'text', required: true, placeholder: 'Enter the product name'},
      id: { type: 'text', required: true, placeholder: 'Enter the product id'},
      color: { type: 'text', required: true },
      style: { type: 'text', required: false }
    };
    $scope.filterMetaInfo = function(obj) {
      console.log(obj);
      return metaInfo[obj];
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
})();
