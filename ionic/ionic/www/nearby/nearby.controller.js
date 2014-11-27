var ctrlModule = angular.module('pooler.controllers');
ctrlModule
  .controller('NearbyCtrl', ['$scope', '$ionicLoading', '$compile', 'GoogleMapApi'.ns(), '$filter',
                             'nearbyService', '$ionicModal', '$state', '$ionicPopup',
    function ($scope, $ionicLoading, $compile, GoogleMapApi, $filter, nearbyService, $ionicModal, $state, $ionicPopup) {
      var coords = {};

      nearbyService.getUserCoords().then(function(position){
        coords.latitude = position.coords.latitude;
        coords.longitude = position.coords.longitude;
        getNearbyTrips();

        GoogleMapApi.then(function (maps) {
          $scope.map = {
            center: { latitude: coords.latitude, longitude: coords.longitude },
            zoom: 14
          };
        });
      })

      $scope.requestTrip = function(requestedTripInfo, requestedUserInfo, requestInfo){
        nearbyService.requestTrip(requestedTripInfo, requestedUserInfo, requestInfo).then(function(){
          var confirmPopup = $ionicPopup.confirm({
            title: '<span class="text-center">Trip Requested!</span>',
            template: 'Your trip request has been sent',
            buttons: [
              { text: '<span class="font-size-14">Close</span>' },
              {
                text: '<span class="font-size-14">View Matches</span>',
                type: 'button-energized',
                onTap: function(e) {
                  console.log(e);
                 return true
                }
              }
            ]
          });
          confirmPopup.then(function(res) {
            console.log('res', res);
            if(res) {
              $state.go('tab.matches');
            } else {
            }
            $scope.closeTripMatchRequestModal();
          });

        });
      }


//    workaround for buttons in google maps
      $scope.dataTapDisabled = true;

      function negateDataTapDisabled(){
        $scope.dataTapDisabled = !$scope.dataTapDisabled;
      }



      $scope.closeWindow = function(idKey) {
        var marker = findMarkerByIdKey(idKey);
        marker.windowOpts.visible = false;
        $scope.showPolyline = false;
//        $scope.$apply;
        negateDataTapDisabled()
      };

      $scope.showWindow = function(idKey){
        if ($scope.activeMarker) $scope.activeMarker.windowOpts.visible = false;
        var marker = findMarkerByIdKey(idKey);
        marker.windowOpts.visible = true;
        $scope.activeMarker = marker;
        setPolyline();
        $scope.showPolyline = true;
        $scope.$apply;
        negateDataTapDisabled()
      }

      $scope.markers = [];

      function findMarkerByIdKey(idKey){
        return $filter('filter')($scope.markers, {idKey: idKey}, true)[0];
      }

      function setPolyline(){
        $scope.polyline = {
          path: [
                $scope.activeMarker.departCoords,
                $scope.activeMarker.arrivalCoords
                ]
        }
        console.log($scope.polyline);
      }

      $ionicModal.fromTemplateUrl('nearby/templates/tripMatchRequest.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
          $scope.tripMatchRequestModal = modal;
          //    setup modal show/close
          $scope.showTripMatchRequestModal = function (marker) {
            console.log('yooooooo!');
            $scope.matchMarker = marker;
            $scope.tripMatchRequestModal.show();
          };
          $scope.closeTripMatchRequestModal = function () {
            $scope.tripMatchRequestModal.hide();
          };
        });

      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        $scope.tripMatchRequestModal.remove();
      });

      function getNearbyTrips(){
        var searchDistance = 500000000; //for now, just get all trips; TODO: get only some?
        nearbyService.getTrips(coords, searchDistance).then(function(trips){
          console.log('!trips¡', trips);
          setMarkers(trips);
        });
      }

      function setMarkers(trips){
        angular.forEach(trips, function(trip, index){
          console.log(trip);
          var marker = {
            idKey: index,
            userProfilePicture: trip.user.picture,
            user: trip.user,
            userFirstName: trip.user.first_name,
            departCoords: { latitude: trip.tripInfo.departureLocation.latitude, longitude: trip.tripInfo.departureLocation.longitude},
            arrivalCoords: { latitude: trip.tripInfo.arrivalLocation.latitude, longitude: trip.tripInfo.arrivalLocation.longitude },
            windowOpts: {
              visible: false
            },
            tripInfo: {
              days: trip.tripInfo.days,
              date: trip.tripInfo.date,
              departureTime: trip.tripInfo.departureTime,
              bufferWindow: trip.tripInfo.bufferWindow,
              arrivalAddress: trip.tripInfo.arrivalLocation.formattedAddress,
              departureAddress: trip.tripInfo.departureLocation.formattedAddress,
              recurring: trip.tripInfo.recurring,
              tripInfo: trip.tripInfo,
              requestInfo: {
                departureTime: trip.tripInfo.departureTime,
                departureAddress: trip.tripInfo.departureLocation.formattedAddress,
                departureCoords: { latitude: trip.tripInfo.departureLocation.latitude, longitude: trip.tripInfo.departureLocation.longitude}
              }
            }
          }
          $scope.markers.push(marker);
        })
      }
    }
  ]);

