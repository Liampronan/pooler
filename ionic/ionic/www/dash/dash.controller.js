var ctrlModule = angular.module('pooler.controllers');
  ctrlModule
    .controller('DashCtrl', function($scope, uberAuthService) {

      $scope.login = uberAuthService.login;

    })