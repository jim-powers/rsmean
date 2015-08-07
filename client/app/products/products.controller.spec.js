'use strict';

describe('Controller: ProductsCtrl', function () {

  // load the controller's module
  beforeEach(module('rsmeanApp'));

  var ctrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('api/v1/products')
      .respond([{'_id':'1', 'name':'Ninja Pro Blender'}, {'_id':'2', 'name':'Super Floppy Hat'}]);

    scope = $rootScope.$new();
    ctrl = $controller('ProductsCtrl', {
      $scope: scope
    });
  }));

  it('should define gridOptions', function () {
    $httpBackend.flush();
    expect(scope.gridOptions).not.toBe(null);
    expect(scope.gridOptions.data.length).toBe(2);
  });

  it('gridOptions.data should have object', function () {
    $httpBackend.flush();
    expect(scope.gridOptions.data.length).toBe(2);
  });
});
