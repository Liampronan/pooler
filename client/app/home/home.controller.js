'use strict';

angular.module('pooler')
    .controller('HomeCtrl', function ($scope, $http) {

      if (!linkedinDataService.getUserInfo()){
          linkedinDataService.setUserInfo().then(function(){
            if (!linkedinDataService.getUserInfo()){
              console.log('creating....');
              userService.create().then(function(){
                redirectToTrips();
                console.log('created!');
              }, function(err){
                console.log(err);
              });
            }
            setUserInfo()
          })
      } else {
          userService.setUser().then(function(){
            userService.setTrips().then(function(){
              setUserInfo()
              redirectToTrips();
            })
          })
      }

      function getCurrentPosition(positions){
        var currentPosition = null;
        angular.forEach(positions, function(position, key){
          if (position.isCurrent){
            currentPosition = position;
          }
        })
        return currentPosition
      }

      function removeDuplicateCompanies(positions){
        var companies = [];
        var positionsNoDuplicates = [];
        angular.forEach(positions, function(position, key){
          var company = getCompanyFrom(position);
          if (companies.indexOf(company) === -1){
//          TODO: could probably optimize this with just one array..
            companies.push(company);
            positionsNoDuplicates.push(position);
          }
        })
        return positionsNoDuplicates
      }

      function getCompanyFrom(position){
        return position.company.name
      }

      function setScopeUser(user){
        $scope.name = user.formattedName;
        $scope.fName = user.firstName;
        $scope.title = user.headline;
        $scope.industry = user.industry;
        $scope.skills = user.skills.values;
        $scope.educations = user.educations.values;
        $scope.positions = removeDuplicateCompanies(user.positions.values);
        $scope.currentPosition = getCurrentPosition(user.positions.values);
        $scope.profilePicture = user.pictureUrl;
      }

      function setUserInfo(){
        var user = linkedinDataService.getUserInfo();
        setScopeUser(user)
      }

      function redirectToTrips(){
        $scope.trips = userService.getUser()['trips'];
        console.log('trips', $scope.trips);
          if ($scope.trips.length === 0){
            $state.go('home.newUser');
          } else{
            $state.go('home')
          }
      }
    });
