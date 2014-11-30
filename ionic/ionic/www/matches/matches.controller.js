var ctrlModule = angular.module('pooler.controllers');
ctrlModule
  .controller('MatchesCtrl', ['$scope', '$state', 'userService', '$ionicModal', 'matchForTripFilter', 'matchUserFilter',
    'tripForMatchFilter', 'GoogleMapApi'.ns(), '$filter', '$window', 'messageService', 'nearbyService', 'uberAuthService',
    function ($scope, $state, userService, $ionicModal, matchForTripFilter, matchUserFilter, tripForMatchFilter,
              GoogleMapApi, $filter, $window, messageService, nearbyService, uberAuthService) {
    var tripIndex = $state.params.tripIndex || 0,
        matchesUsers,
        mapid = 0;

    //setUser(user, bustCache)
    userService.setUser(false, true).then(function(user){
//      userService.retrieveMatchesUsers().then(function(){
        setTripMatches(user);
        //set initial trip
        $scope.setTrip(tripIndex);
//      });

    });

    $scope.nearTripDepartureTime = function(){
        return false
    }

    $scope.trips = userService.getTrips();
      
    $scope.acceptRequest = function(){
        userService.acceptRequest($scope.tripMatch.id).then(function(){
          $scope.tripMatch.requestInfo.accepted = true;
        })
    }

    $scope.sendMessage = function(){
        messageService.create($scope.tripMatchUser.uuid || $scope.tripMatchUser.uberid, $scope.user.uberid, $scope.message)
          .then(function(){
            setMessages();
          })
    }
      
    $scope.requestTrip = function(){
      var requestInfo =  {
        departureTime: $scope.tripMatch.requestInfo.departureTime,
          departureAddress:  $scope.markers[2].meetupPoint,
          departureCoords: { latitude: $scope.markers[2].departCoords.latitude, longitude: $scope.markers[2].departCoords.longitude}
      }
      nearbyService.requestTrip($scope.tripMatch.matchTrip, $scope.tripMatchUser, requestInfo, $scope.trip).then(function(){
        $scope.tripMatch.requestInfo.requestorid = $scope.user.uberid;
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

          $scope.closeSelectMeetupPointModal = function() {
            $scope.selectMeetupPointModal.hide();
//            $scope.selectMeetupPointModal.remove();
          };

          $scope.$on('$destroy', function () {
            $scope.selectMeetupPointModal.remove();
          });

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

          setMarkers();

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

    $scope.$on('matches:updated', function(event, data){
      $scope.user = userService.getUser();
      setTripMatches($scope.user);
      $scope.setTrip(tripIndex);
    });
    $scope.$on('messages:updated', function(event, data){
      console.log('updatinng msgzzz');
      setMessages();
    });

    function setMessages(){
      $scope.messages = messageService.getMessagesWith($scope.tripMatchUser.uuid || $scope.tripMatchUser.uberid);
      $scope.message = "";
//      $scope.numMessagesUnread = numMessagesUnreadFilter($scope.messages, currentUser.linkedInUserId);
      console.log('m', $scope.messages);
    }



    function setTripMatches(user){
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
          if ($scope.selectMeetupPointModal) $scope.selectMeetupPointModal.remove();
          setupMap();
          setMarkers();
          if ($scope.tripMatch.requestInfo){
            var uberClientId = uberAuthService.clientId,
              requestURL =
              "uber://?client_id=" + uberClientId + "&action=setPickup" +
                "&pickup[latitude]=" + $scope.tripMatch.requestInfo.departureCoords.latitude +
                "&pickup[longitude]=" + $scope.tripMatch.requestInfo.departureCoords.longitude +
                "&pickup[formatted_address]=" + $scope.tripMatch.requestInfo.departureAddress.formatted_address.replace(' ', '%20') +
                "&pickup[nickname]=" + $scope.tripMatch.requestInfo.departureAddress.formatted_address.replace(' ', '%20') +
                "&dropoff[latitude]=" + $scope.tripMatch.matchTrip.arrivalLocation.latitude +
                "&dropoff[longitude]=" + $scope.tripMatch.matchTrip.arrivalLocation.longitude +
                "&dropoff[formatted_address]=" + $scope.tripMatch.matchTrip.arrivalLocation.formattedAddress.replace(' ', '%20');

            $scope.requestUberURL = requestURL;
          }
        }
        $scope.loaded = true;
      };
    }

    function setMarkers(){
      $scope.matchTripsMidpoint = $window.google.maps.geometry.spherical.interpolate(
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
          idKey: ++mapid,
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
          idKey: ++mapid,
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
          idKey: ++mapid,
          departCoords: {
            latitude: $scope.matchTripsMidpoint.k,
            longitude: $scope.matchTripsMidpoint.B
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
      ];
    }

  }]);