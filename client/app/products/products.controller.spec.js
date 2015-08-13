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

    // ui-router doesn't play well with unit tests
    // hence this hack work-around http get dance
    // https://github.com/angular-ui/ui-router/issues/212
    //
    $httpBackend.expectGET('bower_components/s44-styleguide/client/components/flash/flash.html').respond('');
    $httpBackend.expectGET('components/navbar/navbar.html').respond('');
    $httpBackend.expectGET('app/nav-left.html').respond('');
    $httpBackend.expectGET('app/nav-right.html').respond('');
    $httpBackend.expectGET('bower_components/s44-styleguide/client/components/layout/footer/footer.html').respond('');
    $httpBackend.expectGET('bower_components/s44-styleguide/client/components/login/form.html').respond('');
    $httpBackend.expectGET('app/main/main.html').respond('');

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

  it('should attach a list of products to the gridOptions', function () {
    $httpBackend.flush();
    expect(scope.gridOptions.data.length).toBe(2);
  });

});
