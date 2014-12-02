var ctrlModule = angular.module('pooler.controllers');
  ctrlModule
    .controller('DashCtrl', ['$scope', 'uberAuthService', 'userService', '$state', '$ionicPopup', 'nearbyService',
      '$translate', '$ionicViewService', 'matchForTripFilter', '$rootScope',
      function($scope, uberAuthService, userService, $state, $ionicPopup, nearbyService, $translate,
               $ionicViewService, matchForTripFilter, $rootScope) {
        if (userService.getUser()) $state.go('tab.dash-home-logged-in');
        $scope.loaded = false;
        userService.setUser().then(function(user){
          $rootScope.matchCount = user.matches.length;
          $scope.user = user;
          if ($scope.user.uberid){
            $state.go('tab.dash-home-logged-in');
            $ionicViewService.clearHistory(); // clear history so user doesn't see back (that would redirect back here)
            $scope.trips = userService.getTrips();
            if ($scope.trips && $scope.trips.length > 0){
              $scope.tripIndex = 0;
              $scope.trip = $scope.trips[$scope.tripIndex];
              console.log($scope.trips);
              $scope.tripMatch = matchForTripFilter($scope.user, $scope.trip);
            }
          }
          $scope.loaded = true;
        });

        $translate.use() === 'en' ? moment.locale('en') : moment.locale('zh-cn'); //set initial moment locale
        $scope.selectedLangKey = $translate.use();

        $scope.login = uberAuthService.login;

        $scope.nextTrip = function(){
          ++$scope.tripIndex > $scope.trips.length - 1 ? $scope.tripIndex = 0 : false;
          $scope.trip = $scope.trips[$scope.tripIndex];
        };

        $scope.setLanguage = function(langKey){
          $translate.use(langKey);
          $scope.selectedLangKey = $translate.use();
          //when changing language, also change moment's locale for localized formatting
          if (langKey === 'zh'){
            moment.locale('zh-cn');
          } else if (langKey === 'en'){
            moment.locale('en');
          }
        };
        
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