(function() {
  /* globals Big: false */
  /* jshint -W064 */
  'use strict';

  /**
   * @ngInject
   * @constructor
   */
  function ProductCtrl($scope, $state, uiGridConstants, uiGridGroupingConstants, uiGridTreeViewConstants, $http, flashService, $modal /*, PocDataModel*/) {
    document.title = document.title + ' - ' + $state.current.name;
    var productsApiUrl = 'api/v1/products';
    $scope.todoItems = [
      { title: 'Provide FMD', completed: false }
    ];
    $scope.doTodo = function(item) {
      console.log(item);
    };
    $scope.product = { _id: $state.params.id, name: 'my product', substances: [] };
    $scope.productName = $scope.product.name;
    $scope.data = [];
    $scope.fmdData = [];
    $scope.fmdData = $scope.product.substances;
    // The representation of units is a bit tricky
    // html select really expects it to be a string, even though the 'value' may be a number
    // The simplest solution is to use == rather than === when checking for a match
    // You see this in the html as ng-selected="optVal == displayWtUnits" for example
    // Not sure what's best for the API / database
    $scope.substanceUnitsMetaInfo = {
      kg: 1000000, g: 1000, mg: 1
    };
    $scope.getDisplayUnits = function(value) {
      var key = '';
      var n = Number(value);
      _.each($scope.substanceUnitsMetaInfo, function (v, k) {
        if (v === n) {
          key = k;
        }
      });
      return key;
    };
    $scope.displayWtUnits = 1;

    // Normal javascript Number object results in rounding errors, try 6 kg, 3 g and 3 mg for the 3 substance weight
    // The display value in kg comes out as: 6.0030030000000005
    // Uses big.js but if you ng-bind="productWt()", angularjs watches this function and gets all tweaked by $digest cycles
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
      } catch (e) {
      }
      return Big(0);
    };
    $scope.productWt = function() {
      return $scope._productWt($scope.product);
    };
    $scope.displayProductWt = function() {
      return $scope.productWt().toString();
    };
    $scope.getWtPct = function(wt, wtUnits) {
      try {
        if (wt && wtUnits) {
          var wtProduct = $scope.productWt();
          if (wtProduct) {
            return Big(100).times(Big(wt).times(Big(wtUnits)).div(wtProduct));
          }
        }
      } catch (e) {

      }
      return Big(0);
    };
    $scope.displayWtPct = function(wt, wtUnits) {
      return $scope.getWtPct(wt, wtUnits).toString();
    };
    $scope.getWtPpm = function(wt, wtUnits) {
      return Big(10000).times($scope.getWtPct(wt, wtUnits));
    };
    $scope.displayWtPpm = function(wt, wtUnits) {
      return $scope.getWtPpm(wt, wtUnits).toString();
    };
    $http.get(productsApiUrl + '/' + $state.params.id)
      .success(function(data/*, status, headers, config*/) {
        $scope.product = data[0];
        $scope.product.wt = $scope.productWt();
        $scope.productName = $scope.product.name;
        $scope.product.substances = $scope.product.substances || [];
        var treeData = [];
        for (var i=0; i < $scope.product.substances.length; i++) {
          if (0 === i%3) {
            treeData.push({name: 'component ' + i, wt: ''+i});
            treeData[treeData.length-1].$$treeLevel = 0;
          }
          treeData.push($scope.product.substances[i])
          treeData[treeData.length-1].$$treeLevel = 1;
        }
        //$scope.product.substances[2].$$treeLevel = 2;
        $scope.gridOptions2.data = treeData; //$scope.product.substances;
      });
    $scope.updateProduct = function(data) {
      $http.put(productsApiUrl + '/' + data._id, data)
        .success(function(/*data, status, headers, config*/) {
          $scope.gridOptions2.data = $scope.product.substances;
          flashService.push({template : 'Product updated', level : 'success'});
        })
        .error(function(/*response*/) {
          flashService.push({template : 'Product update failed', level : 'error'});
        });
    };
    $scope.saveProductName = function(newValue/*, oldValue*/) {
      $scope.product.name = newValue;
      $scope.updateProduct($scope.product);
    };
    $scope.saveImageUrl = function(imageUrl) {
      $scope.product.imageUrl = imageUrl;
      $scope.updateProduct($scope.product);
    };
    $scope.saveProduct = function() {
      $scope.updateProduct($scope.product);
    };
    $scope.setFmdComplete = function() {
      $scope.product.isFmdComplete = true;
      $scope.updateProduct($scope.product);
    };
    $scope.allowUpdateFmd = function() {
      $scope.product.isFmdComplete = false;
      $scope.updateProduct($scope.product);
    };
    $scope.addField = function(fieldName) {
      $scope.metaInfo[fieldName] = {type : 'text'};
      $scope.product[fieldName] = '';
    };
    $scope.submitForm = function() {
      console.log($scope.product);
      console.log($scope.userForm);
    };
    $scope.hasFile = false;
    $scope.fileNameChanged = function() {
      var f = document.getElementById('file').files[0];
      $scope.hasFile = !!f;
      $scope.$apply();
    };
    // upload file to server -- HTML5 FileReader approach
    $scope.uploadFile = function() {
      var imageType = /image.*/;
      var f = document.getElementById('file').files[0];
      if (f) {
        var r = new FileReader();
        r.onloadend = function(/*e*/) {
          if (f.type.match(imageType)) {
            // Create a new image.
            var img = new Image();
            img.src = r.result;
            img.style.width = '100%';
            var $fileDisplayArea = document.getElementById('fileDisplayArea');
            // Add the image to the page.
            $fileDisplayArea.innerHTML = '';
            $fileDisplayArea.appendChild(img);
          }
          var object = {};
          object.filename = f.name;
          object.data = event.target.result;
          var data = {filename : object.filename, data : object.data};
          $http.post('products/upload', data)
            .success(function(/*data, status, headers, config*/) {
              flashService.push({template : 'File uploaded', level : 'success'});
            })
            .error(function() {
              flashService.push({template : 'File upload failed.', level : 'error'});
            });
        };
        r.readAsDataURL(f);
      }
    };

    $scope.editRow = function(row) {
      var index = $scope.product.substances.indexOf(row.entity);
      if (index !== -1) {
        var modalInstance = $modal.open({
          animation   : $scope.animationsEnabled,
          templateUrl : 'substanceModal.html',
          controller  : 'ProductSubstanceModalInstanceCtrl',
          size        : 'substance',
          resolve     : {
            modalTitle             : function() {
              return 'Add Substance';
            },
            columns                : function() {
              return $scope.columns;
            },
            substance              : function() {
              return row.entity;
            },
            substanceUnitsMetaInfo : function() {
              return $scope.substanceUnitsMetaInfo;
            },
            onContinue : function() {
              return null;
            }
          }
        });
        modalInstance.result.then(function(selectedItem) {
          $scope.selected = selectedItem;
          $scope.product.substances[index] = selectedItem;
          var data = $scope.product;
          $http.put(productsApiUrl + '/' + data._id, data)
            .success(function(/*data, status, headers, config*/) {
              $scope.formData = {}; // clear the form so our user is ready to enter another
              $http.get(productsApiUrl + '/' + data._id)
                .success(function(data/*, status, headers, config*/) {
                  $scope.product = data[0];
                  $scope.product.substances = $scope.product.substances || [];
                  $scope.gridOptions2.data = $scope.product.substances;
                });
            });
        }, function() {
          //console.log('Modal dismissed at: ' + new Date());
        });
      }
    };

    $scope.removeRow = function(row) {
      var index = $scope.product.substances.indexOf(row.entity);
      if (index !== -1) {
        $scope.product.substances.splice(index, 1);
        $scope.updateProduct($scope.product);
      }
    };
    $scope.addAnother = function(selectedItem) {
      console.log('addAnother');
      console.log(selectedItem);
      if (selectedItem) {
        $scope.selected = selectedItem;
        $scope.product.substances.push(selectedItem);
        $scope.updateProduct($scope.product);
      }
    };
    // CRUD operations for a product
    $scope.addSubstance = function() {
      var modalInstance = $modal.open({
        animation   : $scope.animationsEnabled,
        templateUrl : 'substanceModal.html',
        controller  : 'ProductSubstanceModalInstanceCtrl',
        size: 'substance',
        resolve     : {
          modalTitle : function() {
            return 'Add Substance';
          },
          columns    : function() {
            return $scope.columns;
          },
          substance    : function() {
            return null; // {name : '', cas: ''};
          },
          substanceUnitsMetaInfo : function() {
            return $scope.substanceUnitsMetaInfo;
          },
          onContinue : function() {
            return $scope.addAnother;
          }
        }
      });
      modalInstance.result.then(function(selectedItem) {
        $scope.selected = selectedItem;
        $scope.product.substances.push(selectedItem);
        var data = $scope.product;
        $http.put(productsApiUrl + '/' + data._id, data)
          .success(function(/*data, status, headers, config*/) {
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $http.get(productsApiUrl+'/'+data._id)
              .success(function(data/*, status, headers, config*/) {
                $scope.product = data[0];
                $scope.product.substances = $scope.product.substances || [];
                $scope.gridOptions2.data = $scope.product.substances;
              });
          });
      }, function() {
        //console.log('Modal dismissed at: ' + new Date());
      });
    };

    /*jshint multistr: true */
    function rowTemplate() {
      var template =
        '<div data-row-id="row-{{row.entity.myNumber}}" ng-style="{ height: row.entity.myNumber ? \'100px\' : \'300px\'}"> \
          <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" \
                class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader}">\
                <div ui-grid-cell></div>\
          </div> \
        </div>';
      return template;
    }
    $scope.gridOptions2 = {
      enableSorting: true,
      enableScrollbars : true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.ALWAYS,
      //enableColumnMenus: false,
      enableColumnResizing: true,
      treeRowHeaderAlwaysVisible: false,
      showTreeExpandNoChildren: false,
      onRegisterApi: function( gridApi ) {
        $scope.grid2Api = gridApi;
      },
      displayUnits: $scope.substanceUnitsMetaInfo,
      //rowHeight: 100,
      rowTemplate: rowTemplate(),
      columnDefs: [
        {
          name         : 'Actions',
          field        : 'actions',
          width        : 70,
          pinnedRight  : true,
          cellTemplate : '<div class="ui-grid-cell-contents button-cell"><i class="fa fa-edit" style="margin: 0 5px;" ng-click="grid.appScope.editRow(row)" ></i><i class="fa fa-remove" style="margin: 0 5px;" ng-click="grid.appScope.removeRow(row)"></i></div>'
        },
        {
          name: 'state',
          grouping: { groupPriority: 0 },
          sort: { priority: 0, direction: 'desc' },
          //width: '35%',
          cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
        },
        {
          field: 'name',
          sort: {
            priority: 1
          },
          width: 200
        },
        {
          field: 'cas',
          displayName: 'CAS',
          width: 100
        },
        {
          field: 'wt',
          displayName: 'Weight',
          width: 100,
          sortingAlgorithm: function(a, b) {
            var n1 = Big(a);
            var n2 = Big(b);
            return (n1.gt(n2)) ? 1 : (n2.gt(n1)) ? -1 : 0;
          },
          cellTemplate : '<div class="ui-grid-cell-contents">{{row.entity.wt}} {{grid.appScope.getDisplayUnits(row.entity.wtUnits)}}</div>',
        },
        {
          displayName: 'wt1',
          field: 'wt',
          //width: '25%',
          treeAggregationType: uiGridTreeViewConstants.aggregation.SUM,
          //cellFilter: 'currency',
          cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP"><span>{{row.entity.wt CUSTOM_FILTERS}}</span><span ng-if="row.entity[\'$$\' + col.uid]"> ({{row.entity["$$" + col.uid].value CUSTOM_FILTERS}})</span></div>'
        },
        {
          field: 'wt',
          displayName: 'WT %',
          cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.displayWtPct(row.entity.wt, row.entity.wtUnits)}}</div>'
        },
        {
          field: 'ppm',
          displayName: 'ppm',
          cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.displayWtPpm(row.entity.wt, row.entity.wtUnits)}}</div>'
        }
      ]
    };
    $scope.gridOptions2.data = $scope.product.substances;
    //$scope.gridOptions2.data = [ {cas:'7440-21-3', name: 'Silicon', wt: '16.906', wtUnits: 'mg'} ];
  }
  angular.module('rsmeanApp').controller('ProductCtrl', ProductCtrl);

  /**
   * @ngInject
   * @constructor
   */
  function ProductSubstanceModalInstanceCtrl($scope, $http, $modalInstance, modalTitle, substance, columns, substanceUnitsMetaInfo, onContinue) {
    $scope.modalTitle = modalTitle;
    $scope.substance = substance;
    $scope.columns = columns;
    $scope.model = substance;
    $scope.onContinue = onContinue;
    $scope.substanceUnitsMetaInfo = substanceUnitsMetaInfo;
    $scope.mySelectedSubstance = substance;
    $scope.metaInfo = {
      name: { type: 'text', required: true, placeholder: 'Enter the product name'},
      id: { type: 'text', required: true, placeholder: 'Enter the product id'},
      color: { type: 'text', required: false },
      style: { type: 'text', required: false }
    };

    $scope.getSubstances = function(val) {
      return $http.get('/api/v1/substances?q='+val)
        .then(function(response) {
          return response.data.results;
        });
    };

    $scope.onSelect = function(item, model, label) {
      _.assign($scope.mySelectedSubstance,model);
      $scope.mySelectedSubstance.search = label;
    };

    $scope.selected = {
      substance : $scope.substance,
      mySelectedSubstance: $scope.mySelectedSubstance
    };

    $scope.continue = function() {
      //$modalInstance.close($scope.mySelectedSubstance);
      $scope.onContinue($scope.mySelectedSubstance);
      delete $scope.mySelectedSubstance;
      $scope.userForm.$setPristine();
      _.each(['cas','name','wt'], function(element) {
        $scope.userForm[element] = '';
      });
    };

    $scope.ok = function() {
      $modalInstance.close($scope.mySelectedSubstance);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }
  angular.module('rsmeanApp').controller('ProductSubstanceModalInstanceCtrl', ProductSubstanceModalInstanceCtrl);

})();