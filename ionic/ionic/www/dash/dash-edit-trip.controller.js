var ctrlModule = angular.module('pooler.controllers');
ctrlModule
  .controller('DashTripCtrl', ['$scope', 'uberAuthService', 'userService', '$state', 'GoogleMapApi'.ns(), '$ionicModal',
    '$ionicPopup', '$translate',
      function ($scope, uberAuthService, userService, $state, GoogleMapApi, $ionicModal, $ionicPopup, $translate) {
        var tripIndex = $state.params.tripIndex,
          isNewTrip = tripIndex === null,
          existingUserTrip,
          langKey = $translate.use();

        $scope.isNewTrip = isNewTrip;

        if (langKey === 'zh'){
          $scope.availableDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
        } else if (langKey === 'en'){
          $scope.availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        }


        if (isNewTrip){
          $scope.trip = {
            departureLocation: undefined,
            arrivalLocation: undefined,
            departureTime: moment().format('HH:mm'),
            bufferWindow: 15, //default buffer window is 15 minutes
            recurring: false,
            date: new Date().toISOString().substring(0, 10), //default day is today - ignored if trip isn't recurring
            days: [false, false, false, false, false, false, false]
          };
        } else {
          var trips = userService.getTrips();
          $scope.trip = trips[tripIndex];
          $scope.trip.days = $scope.trip.days || [false, false, false, false, false, false, false];
        }

        $scope.switchTripType = function(isRecurring){
          //only change trip type if user clicks non-selected button
          if (isRecurring && !$scope.trip.recurring || !isRecurring && $scope.trip.recurring){
            $scope.trip.recurring = !$scope.trip.recurring;
          }
        };

        $scope.tripDaySelected = function(){
          return $scope.trip.recurring && $scope.trip.days.indexOf(true) > -1;
        };

        $scope.createTrip = function(){
          var trip = angular.copy($scope.trip); //copy obj so we don't mess up $scope.trips when formatting data for b/e
          userService.createTrip(trip).then(function(success){
           $state.go('tab.dash-home-logged-in')
          })
        };

        $scope.updateTrip = function(){
          var trip = angular.copy($scope.trip); //copy obj so we don't mess up $scope.trips when formatting data for b/e
          userService.updateTrip(trip, tripIndex).then(function(success){
            $state.go('tab.dash-home-logged-in')
          })
        };

        //TODO: use angular to validate
        $scope.isReadyToSubmit = function(){
          if ($scope.trip.recurring){
            return $scope.tripDaySelected() && $scope.trip.departureLocation && $scope.trip.arrivalLocation
          } else {
            return $scope.trip.departureLocation && $scope.trip.arrivalLocation;
          }
        };

        $scope.showBufferWindowPopup = function() {
          var alertPopup = $ionicPopup.alert({
            title: 'Buffer Window',
            template: '<div class="text-center"> Window (in minutes) around your departure time. A larger buffer window' +
              ' will increase your likelihood of finding a matched rider </div>',
            okType: 'button-stable'
          });
        };

        GoogleMapApi.then(function (maps) {
          console.log('loaded!');
          $scope.map = {
            center: { latitude: 37.796207599999995, longitude: -122.4100767 },
            zoom: 14
          };

        });

        $ionicModal.fromTemplateUrl('dash/templates/selectLocationModal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.selectLocationModal = modal;
            //    setup modal show/close
            $scope.showSelectLocationModal = function () {
              $scope.selectLocationModal.show();
            };
            $scope.closeSelectLocationModal = function () {
              $scope.selectLocationModal.hide();
            };
          });

        $ionicModal.fromTemplateUrl('dash/templates/selectTripDateModal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.selectTripDateModal = modal;
            //    setup modal show/close
            $scope.showSelectTripDateModal = function () {
              $scope.selectTripDateModal.show();
            };
            $scope.closeSelectTripDateModal = function () {
              $scope.selectTripDateModal.hide();
            };
          });

        $ionicModal.fromTemplateUrl('dash/templates/selectTripDaysModal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.selectTripDaysModal = modal;
            //    setup modal show/close
            $scope.showSelectTripDaysModal = function () {
              $scope.selectTripDaysModal.show();
            };
            $scope.closeSelectTripDaysModal = function () {
              $scope.selectTripDaysModal.hide();
            };
          });

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
          $scope.selectLocationModal.remove();
          $scope.selectTripDateModal.remove();
          $scope.selectTripDaysModal.remove();
        });

      }
  ]);