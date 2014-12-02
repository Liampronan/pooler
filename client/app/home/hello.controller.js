'use strict';

angular.module('pooler')
  .controller('HelloCtrl', function ($scope, $http, $state) {
    $scope.hello = 'hello!!';
    
    $scope.saveEmail = function(){
        $http.get('http://23.253.95.97/api/referral/notifyMe?email=' + $scope.email).then(function(){
            $scope.emailSaved = true;
        })
    }

  });
