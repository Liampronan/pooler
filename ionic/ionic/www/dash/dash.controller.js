var ctrlModule = angular.module('pooler.controllers');
  ctrlModule
    .controller('DashCtrl', ['$scope', 'uberAuthService', 'userService', '$state', '$ionicPopup',
      function($scope, uberAuthService, userService, $state, $ionicPopup) {
        userService.setUser().then(function(user){
          $scope.user = user;
          if ($scope.user.uberid){
            $state.go('tab.dash-home-logged-in');
            $scope.trips = userService.getTrips();
            if ($scope.trips && $scope.trips.length > 0){
              $scope.tripIndex = 0;
              $scope.trip = $scope.trips[$scope.tripIndex];
              console.log($scope.trips);
            }
          }
        });


        $scope.login = uberAuthService.login;

        $scope.nextTrip = function(){
          ++$scope.tripIndex > $scope.trips.length - 1 ? $scope.tripIndex = 0 : false;
          $scope.trip = $scope.trips[$scope.tripIndex];
        }

        // confirm dialog
        $scope.showDeleteConfirm = function(trip) {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Trip',
            template: '<p class="text-center">Are you sure you want to delete this trip?</p>',
            okText: 'Delete'
          });
          confirmPopup.then(function(res) {
            if(res) {
              deleteTrip(trip)
            } else {

            }
          });
        };

        function deleteTrip(trip){
          userService.deleteTrip(trip).then(function(trips){
            $scope.trips = trips;
            $scope.tripIndex = 0;
            $scope.trip = $scope.trips[$scope.tripIndex];
            $scope.flashMessage = "Trip removed! Why not add another?"
          }, function(err){

          })
        }

      }
    ]);