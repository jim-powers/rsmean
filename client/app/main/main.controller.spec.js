'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('rsmeanApp'));

  var MainCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, flashService) {
    //$httpBackend = _$httpBackend_;
    //$httpBackend.expectGET('/api/things')
    //  .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    flashService.push = function(msg) {
      console.log(msg);
    };
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      flashService: flashService
    });
  }));

  it('should attach a list of things to the scope', function () {
    //$httpBackend.flush();
    expect(scope.todoItems.length).toBe(2);
  });
});
