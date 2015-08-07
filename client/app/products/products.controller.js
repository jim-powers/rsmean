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
   .controller('ProductsCtrl', function($scope, $state, $http, uiGridConstants, $modal) {
      document.title = document.title + ' - ' + $state.current.name;
      function prepareDataForGrid(data) {
        data.forEach(function(row, index) {
          row.myNumber = index;
          row.status = Math.floor(Math.random() * 100);
        });
        return data;
      }

      var productsApiUrl = 'api/v1/products';

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
      // get all the products
      $http.get(productsApiUrl)
        .success(function(data/*, status, headers, config*/) {
          $scope.gridOptions.data = prepareDataForGrid(data);
        });
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
          var data = selectedItem.product;
          delete data._id;
          $http.post(productsApiUrl, data)
            .success(function(/*data, status, headers, config*/) {
              $scope.formData = {}; // clear the form so our user is ready to enter another
              $http.get(productsApiUrl)
                .success(function(data/*, status, headers, config*/) {
                  $scope.gridOptions.data = prepareDataForGrid(data);
                });
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
          var data = selectedItem.product;
          $http.put(productsApiUrl + '/' + data._id, data)
            .success(function(/*data, status, headers, config*/) {
              $scope.formData = {}; // clear the form so our user is ready to enter another
              $http.get('products')
                .success(function(data/*, status, headers, config*/) {
                  $scope.gridOptions.data = prepareDataForGrid(data);
                });
            });
        }, function() {
          //console.log('Modal dismissed at: ' + new Date());
        });
      };
      $scope.deleteProduct = function(row) {
        var rowId = row.entity._id;
        if (rowId) {
          $http.delete(productsApiUrl + '/' + rowId)
            .success(function(/*data, status, headers, config*/) {
              $scope.formData = {}; // clear the form so our user is ready to enter another
              $http.get('products')
                .success(function(data/*, status, headers, config*/) {
                  $scope.gridOptions.data = prepareDataForGrid(data);
                });
            });
        }
      };
      $scope.addManyProducts = function(num) {
        var numExistingProducts = $scope.gridOptions.data.length;
        for (var i = 0; i < num; i++) {
          var n = Math.floor(Math.random() * numExistingProducts);
          $scope.gridOptions.data.push(angular.copy($scope.gridOptions.data[n]));
        }
        prepareDataForGrid($scope.gridOptions.data);
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

      // Demo on how to call controller function from the grid: note: grid.appScope.onDblClickRow(row)
      $scope.onDblClickRow = function(/*rowItem*/) {
        $scope.gridOptions.columnDefs[5].visible = false;
        $scope.grid2Api.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
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
        rowTemplate       : rowTemplate(),
        columnDefs        : [
          {
            name         : 'Actions',
            field        : 'actions',
            width        : 70,
            pinnedRight  : true,
            cellTemplate : '<div class="ui-grid-cell-contents button-cell"><i class="fa fa-edit" style="margin: 0 5px;" ng-click="grid.appScope.editProduct(row)" ></i><i class="fa fa-remove" style="margin: 0 5px;" ng-click="grid.appScope.deleteProduct(row)"></i></div>'
          },
          //{
          //  field            : 'myNumber',
          //  sort             : {
          //    direction : uiGridConstants.ASC,
          //    priority  : 0
          //  },
          //  sortingAlgorithm : function(a, b) {
          //    var n1 = parseInt(a, 10);
          //    var n2 = parseInt(b, 10);
          //    return (n1 > n2) ? 1 : (n2 > n1) ? -1 : 0; //n1 - n2;
          //  }
          //},
          //{
          //  field: '_id',
          //},
          //{
          //  field        : 'status',
          //  sort         : {},
          //  cellTemplate : '<progressbar class="progress-striped active" max="100" value="row.entity.status" type="success"> <span style="color:black; white-space:nowrap;">{{row.entity.status}}%</span> </progressbar>'
          //},
          {
            displayName  : 'Product Name',
            field        : 'name',
            sort         : {
              priority : 1
            },
            cellTemplate : '<div><a ui-sref="app.product({id: row.entity._id})">{{row.entity.name}}</a></div>',
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
      color: { type: 'text', required: false },
      style: { type: 'text', required: false }
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
