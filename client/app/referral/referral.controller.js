'use strict';

angular.module('pooler')
  .controller('ReferralCtrl', function ($scope, $http, $state, referralService) {

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
