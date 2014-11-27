var ctrlModule = angular.module('pooler.controllers');
ctrlModule
  .controller('MatchesCtrl', ['$scope', '$state', 'userService', '$ionicModal', 'matchForTripFilter', 'matchUserFilter',
    'tripForMatchFilter', 'GoogleMapApi'.ns(), '$filter', '$window', 'messageService',
    function ($scope, $state, userService, $ionicModal, matchForTripFilter, matchUserFilter, tripForMatchFilter,
              GoogleMapApi, $filter, $window, messageService) {
    var tripIndex = $state.params.tripIndex || 0,
        matchesUsers;

    //setUser(user, bustCache)
    userService.setUser(false, true).then(function(user){
      userService.retrieveMatchesUsers().then(function(){
        $scope.user = user;
        matchesUsers = userService.getMatchesUsers();
        $scope.setTrip = function(selectedTripIndex) {
          $scope.trip = $scope.trips[selectedTripIndex];
          $scope.tripMatch = matchForTripFilter($scope.user, $scope.trip);
          console.log($scope.tripMatch);
          if ($scope.tripMatch){
            $scope.tripMatchUser = $scope.tripMatch.matchUser;
            $scope.tripMatchUserTrip = $scope.tripMatch.matchTrip;
            setMessages();
            setupMap();
          }
          console.log('match u ',  $scope.tripMatchUser);
          $scope.loaded = true;
        };
        //set initial trip
        $scope.setTrip(tripIndex);
      });

    });
    $scope.trips = userService.getTrips();
      
    $scope.acceptRequest = function(){
        userService.acceptRequest($scope.tripMatch.id)
    }

    $scope.sendMessage = function(){
        messageService.create($scope.tripMatchUser.uuid || $scope.tripMatchUser.uberid, $scope.user.uberid, $scope.message)
          .then(function(){
            setMessages();
          })
    }

    $ionicModal.fromTemplateUrl('matches/templates/selectTripModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.selectTripModal = modal;

        $scope.closeSelectTripModal = function() {
          $scope.selectTripModal.hide();
        };

//        close modal when user selects a trip
        $scope.$watch('trip', function (newVal, oldVal) {
          $scope.closeSelectTripModal();
        });
        $scope.$on('$destroy', function() {
          $scope.selectTripModal.remove();
          $scope.selectMeetupPointModal.remove();
        });
      });

    $scope.showSelectTripModal = function() {
      $scope.selectTripModal.show();
    };

    $ionicModal.fromTemplateUrl('matches/templates/matchNewMessageModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.matchNewMessageModal = modal;
//    setup modal show/close
        $scope.showMatchNewMessageModal = function() {
          $scope.matchNewMessageModal.show();

        };
        $scope.closeMatchNewMessageModal = function() {
          $scope.matchNewMessageModal.hide();
        };
      });




    function setupMap(){
      $ionicModal.fromTemplateUrl('matches/templates/selectMeetupPointModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
          $scope.selectMeetupPointModal = modal;

          $scope.showSelectMeetupPointModal = function() {
            $scope.selectMeetupPointModal.show();
          };

          $scope.closeSelectMeetupPointModall = function() {
            $scope.selectMeetupPointModal.hide();
          };

//        $scope.$watch('trip', function (newVal, oldVal) {
//          $scope.closeSelectMeetupPointModal();
//        });

          GoogleMapApi.then(function (maps) {
            $scope.map = {
              center: {
                        latitude: $scope.trip.departureLocation.latitude + .01,
                        longitude: $scope.trip.departureLocation.longitude -.0075
                      },
              zoom: 15
            };
          });

          $scope.closeWindow = function(idKey) {
            var marker = findMarkerByIdKey(idKey);
            marker.windowOpts.visible = false;
            $scope.showPolyline = false;
          };

          $scope.showWindow = function(idKey){
            if ($scope.activeMarker) $scope.activeMarker.windowOpts.visible = false;
            var marker = findMarkerByIdKey(idKey);
            marker.windowOpts.visible = true;
            $scope.activeMarker = marker;
            setPolyline();
            $scope.showPolyline = true;
          }
          var matchTripsMidpoint = $window.google.maps.geometry.spherical.interpolate(
              new google.maps.LatLng(
                $scope.trip.departureLocation.latitude,
                $scope.trip.departureLocation.longitude
              ),
              new google.maps.LatLng(
                $scope.tripMatchUserTrip.departureLocation.latitude,
                $scope.tripMatchUserTrip.departureLocation.longitude
              ),
              0.5);

          $scope.markers = [
            {
              idKey: 1,
              departCoords: {
                latitude: $scope.trip.departureLocation.latitude,
                longitude: $scope.trip.departureLocation.longitude
              },
              arrivalCoords: {
                latitude: $scope.trip.arrivalLocation.latitude,
                longitude: $scope.trip.arrivalLocation.longitude
              },
              windowOpts: {
                visible: false
              },
              options: {
                opacity: .7
              },
              trip: $scope.trip,
              userPicture: $scope.user.profilePicture,
              firstName: $scope.user.firstName
            },
            {
              idKey: 2,
              departCoords: {
                latitude: $scope.tripMatchUserTrip.departureLocation.latitude,
                longitude: $scope.tripMatchUserTrip.departureLocation.longitude
              },
              arrivalCoords: {
                latitude: $scope.tripMatchUserTrip.arrivalLocation.latitude,
                longitude: $scope.tripMatchUserTrip.arrivalLocation.longitude
              },
              windowOpts: {
                visible: false
              },
              options: {
                opacity: .7
              },
              trip: $scope.tripMatchUserTrip,
              userPicture: $scope.tripMatchUser.picture,
              firstName: $scope.tripMatchUser.first_name
            },
            {
              //meetup pt.
              idKey: 3,
              departCoords: {
                latitude: matchTripsMidpoint.k,
                longitude: matchTripsMidpoint.B
              },
              windowOpts: {
                visible: false
              },
              options: {
                icon: 'http://library.csun.edu/images/google_maps/marker-green.png',
                draggable: true,
                zIndex: 9001
              },
              setByUser: false //track whether user has set this yet b/c has default coords
            }
          ]

          $scope.setMeetupPoint = function(){
            var geocoder = new google.maps.Geocoder(),
                latlng = new google.maps.LatLng($scope.markers[2].departCoords.latitude,
                                                $scope.markers[2].departCoords.longitude);

            geocoder.geocode({'latLng': latlng}, function (results, status) {
              $scope.markers[2].meetupPoint = results[0];
            });
            $scope.markers[2].setByUser = true;
            $scope.selectMeetupPointModal.hide();
          }

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
        });
    }

    function setMessages(){
      $scope.messages = messageService.getMessagesWith($scope.tripMatchUser.uuid || $scope.tripMatchUser.uberid);
      $scope.message = "";
//      $scope.numMessagesUnread = numMessagesUnreadFilter($scope.messages, currentUser.linkedInUserId);
      console.log('m', $scope.messages);
    }

  }]);