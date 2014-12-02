'use strict';

angular.module('hitcher')
  .controller('MainCtrl', function ($scope, $http, linkedinAuthService, $state) {

      linkedinAuthService.isLoggedIn().then(function(success){
        if (success.data["isLoggedIn"] == true){
          $state.go('home');
        }
      })

      $scope.linkedinAuthUrl = linkedinAuthService.authUrl;

      $scope.linkedinLogin = function(){
        linkedinAuthService.login();
      }


  });
