(function() {
  /* globals Big: false */
  /* jshint -W064 */
  'use strict';

  /**
   * @ngInject
   * @constructor
   */
  function ProductCtrl($scope, $state, uiGridConstants, uiGridGroupingConstants, uiGridTreeViewConstants,
    $http, flashService, $modal, ProductsStore, ProductsUtil, ProductSubstanceModalService) {
    document.title = 'Source Intelligence&reg; - ' + $state.current.name;
    var productsApiUrl = 'api/v1/products';

    $scope.todoItems = [ ];
    $scope.doTodo = function(item) {
    };
    $scope.product = {_id : $state.params.id, name : 'my product', substances : []};
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
      kg : 1000000, g : 1000, mg : 1
    };
    $scope.getDisplayUnits = function(value) {
      var key = '';
      var n = Number(value);
      _.each($scope.substanceUnitsMetaInfo, function(v, k) {
        if (v === n) {
          key = k;
        }
      });
      return key;
    };
    $scope.displayWtUnits = 1;
    $scope.displayProductWt = function() {
      //return ProductsUtil.computeWt($scope.product.substances,$scope.displayWtUnits);
      return ($scope.product.wt) ? Big($scope.product.wt).div(Big($scope.displayWtUnits)).toString() : '';
    };
    $scope.getWtPct = function(wt, wtUnits) {
      try {
        if (wt && wtUnits) {
          var wtProduct = $scope.product.wt; // $scope.productWt();
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
      return $scope.getWtPpm(wt, wtUnits).round().toString();
    };
    function buildComponent(c) {
      var wt = ProductsUtil.computeWt(c.substances, 1);
      c.wt = wt.toString();
      c.wtUnits = 1;
      return c;
    }

    var NO_COMPONENT = '_none';

    function getComponents(substances) {
      var components = {};
      if (substances.length > 0) {
        var sub;
        var i;
        for (i = 0; i < substances.length; i++) {
          sub = substances[i];
          if (sub.component) {
            if (!components[sub.component]) {
              components[sub.component] = {
                name       : sub.component,
                wt         : 0,
                substances : [sub]
              };
            } else {
              components[sub.component].substances.push(sub);
            }
          } else {
            if (!components[NO_COMPONENT]) {
              components[NO_COMPONENT] = {
                name       : NO_COMPONENT,
                wt         : 0,
                substances : [sub]
              };
            } else {
              components[NO_COMPONENT].substances.push(sub);
            }
          }
        }
        angular.forEach(components, function(value, key) {
          components[key] = buildComponent(value);
        });
      }
      return components;
    }

    function getTreeData(substances) {
      var treeData = [];
      var components = getComponents(substances);
      if (substances.length > 0) {
        var sub;
        var i;
        var treeLevel = 0;
        angular.forEach(components, function(value, key) {
          if (key !== NO_COMPONENT) {
            treeData.push(value);
            treeData[treeData.length - 1].type = 'component';
            treeData[treeData.length - 1].$$treeLevel = 0;
            treeLevel = 1;
          } else {
            treeLevel = 0;
          }
          for (i = 0; i < value.substances.length; i++) {
            sub = value.substances[i];
            if (key !== NO_COMPONENT) {
              try {
                sub._wtPctOfComponent = Big(100).times(Big(sub.wt).div(Big(value.wt)));
                sub.wtPctOfComponent = sub._wtPctOfComponent.toString();
                sub.ppmOfComponent = (Big(10000).times(sub._wtPctOfComponent).round()).toString();
              } catch (e) {

              }
            } else {
              delete sub.wtPctOfComponent;
              delete sub.ppmOfComponent;
            }
            treeData.push(sub);
            treeData[treeData.length - 1].type = 'substance';
            treeData[treeData.length - 1].$$treeLevel = treeLevel;
          }
        });
      }
      return treeData;
    }

    $scope.loadProduct = function() {
      ProductsStore.find($state.params.id)
        .success(function(data/*, status, headers, config*/) {
          $scope.product = data[0];
          $scope.product.substances = $scope.product.substances || [];
          var treeData = getTreeData($scope.product.substances);
          $scope.gridOptions2.data = treeData; //$scope.product.substances;
          $scope.todoItems = [
            {title : 'Provide FMD', isComplete : $scope.product.isFmdComplete}
          ];

        });
    };
    $scope.loadProduct();

    $scope.updateProduct = function(data) {
      ProductsStore.updateRecord(data)
        .success(function(/*data, status, headers, config*/) {
          $scope.loadProduct();
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
      $scope.updateProduct($scope.product, true);
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
        var modalInstance = ProductSubstanceModalService.open({
            modalTitle             : function() {
              return 'Add Substance';
            },
            columns                : function() {
              return $scope.columns;
            },
            substance              : function() {
              return row.entity;
            },
            getComponents             : function() {
              return function() { return _.keys(getComponents($scope.product.substances)) } ;
            },
            substanceUnitsMetaInfo : function() {
              return $scope.substanceUnitsMetaInfo;
            },
            onContinue             : function() {
              return null;
            }
          });
        modalInstance.result.then(function(selectedItem) {
          $scope.selected = selectedItem;
          $scope.product.substances[index] = selectedItem;
          //var data = $scope.product;
          $scope.updateProduct($scope.product);
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
      if (selectedItem) {
        $scope.selected = selectedItem;
        $scope.product.substances.push(selectedItem);
        $scope.updateProduct($scope.product);
      }
    };
    // CRUD operations for a product
    $scope.addSubstance = function() {
      var modalInstance = ProductSubstanceModalService.open({
          modalTitle             : function() {
            return 'Add Substance';
          },
          columns                : function() {
            return $scope.columns;
          },
          //components             : function() {
          //  return _.keys(getComponents($scope.product.substances));
          //},
          getComponents             : function() {
            return function() { return _.keys(getComponents($scope.product.substances)) } ;
          },
          substance              : function() {
            return null; // {name : '', cas: ''};
          },
          substanceUnitsMetaInfo : function() {
            return $scope.substanceUnitsMetaInfo;
          },
          onContinue             : function() {
            return $scope.addAnother;
          }
      });
      modalInstance.result.then(function(selectedItem) {
        $scope.selected = selectedItem;
        $scope.product.substances.push(selectedItem);
        //var data = $scope.product;
        $scope.updateProduct($scope.product);
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
      enableSorting              : true,
      enableColumnMenus          : false,
      enableColumnResizing       : true,
      treeRowHeaderAlwaysVisible : false,
      // ui-grid-selection is incompatible with tree view
      showTreeExpandNoChildren   : false,
      onRegisterApi              : function(gridApi) {
        $scope.grid2Api = gridApi;
      },
      displayUnits               : $scope.substanceUnitsMetaInfo,
      rowTemplate                : rowTemplate(),
      columnDefs                 : [
        {
          name         : 'Actions',
          field        : 'actions',
          width        : 70,
          pinnedRight  : true,
          cellTemplate : '<div class="ui-grid-cell-contents button-cell"><i class="fa fa-edit" style="margin: 0 5px;" ng-click="grid.appScope.editRow(row)" ></i><i class="fa fa-remove" style="margin: 0 5px;" ng-click="grid.appScope.removeRow(row)"></i></div>'
        },
        {
          field        : 'name',
          sort         : {
            priority : 1
          },
          width        : 200,
          cellTemplate : '<div class="ui-grid-cell-contents" ng-class="{\'tree-level-1\': row.entity.component}"><i class="icon-{{row.entity.type}}"></i> {{row.entity.name}}</div>'
        },
        {
          field       : 'cas',
          displayName : 'CAS',
          width       : 100
        },
        {
          field            : 'wt',
          displayName      : 'Weight',
          width            : 100,
          sortingAlgorithm : function(a, b) {
            var n1 = Big(a);
            var n2 = Big(b);
            return (n1.gt(n2)) ? 1 : (n2.gt(n1)) ? -1 : 0;
          },
          cellTemplate     : '<div class="ui-grid-cell-contents">{{row.entity.wt}} {{grid.appScope.getDisplayUnits(row.entity.wtUnits)}}</div>',
        },
        {
          displayName : 'WT % of Component',
          field       : 'wtPctOfComponent',
          //width: '25%',
          //treeAggregationType: uiGridTreeViewConstants.aggregation.SUM,
          //cellFilter: 'currency',
          //cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP"><span>{{row.entity.wt CUSTOM_FILTERS}}</span><span ng-if="row.entity[\'$$\' + col.uid]"> ({{row.entity["$$" + col.uid].value CUSTOM_FILTERS}})</span></div>'
        },
        {
          displayName : 'ppm of Component',
          field       : 'ppmOfComponent'
          //width: '25%',
          //treeAggregationType: uiGridTreeViewConstants.aggregation.SUM,
          //cellFilter: 'currency',
          //cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP"><span>{{row.entity.wt CUSTOM_FILTERS}}</span><span ng-if="row.entity[\'$$\' + col.uid]"> ({{row.entity["$$" + col.uid].value CUSTOM_FILTERS}})</span></div>'
        },
        {
          field        : 'wt',
          displayName  : 'WT %',
          cellTemplate : '<div class="ui-grid-cell-contents">{{grid.appScope.displayWtPct(row.entity.wt, row.entity.wtUnits)}}</div>'
        },
        {
          field        : 'ppm',
          displayName  : 'ppm',
          cellTemplate : '<div class="ui-grid-cell-contents">{{grid.appScope.displayWtPpm(row.entity.wt, row.entity.wtUnits)}}</div>'
        }
      ]
    };
    $scope.gridOptions2.data = $scope.product.substances;
    //$scope.gridOptions2.data = [ {cas:'7440-21-3', name: 'Silicon', wt: '16.906', wtUnits: 'mg'} ];
  }

  angular.module('rsmeanApp').controller('ProductCtrl', ProductCtrl);

})();
