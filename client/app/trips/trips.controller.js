'use strict';

angular.module('hitcher')
    .controller('TripsCtrl', function ($scope, $http, $state, caltrainDataService, userService) {
      $scope.caltrainTrips = [];
      $scope.disabled = 'disabled';
      $scope.direction = 'SB';
      
      $scope.switchDirection = function(){
        if ($scope.direction === 'SB'){
          $scope.direction = 'NB';
          setStations($scope.northboundStations);
        } else{
          $scope.direction = 'SB';
          setStations($scope.southboundStations);
        }
      }
//    TODO: implement arrivalStation update (based on departureStation)
      $scope.updateStations = function(){
//        console.log($scope.departureStation.stopId);
      }

      $scope.findRides = function(departureStation, arrivalStation){
        caltrainDataService.getTrips(departureStation, arrivalStation)
          .then(function(success){
//          TODO: these trips should not be returning from db..
            $scope.caltrainTrips  = removeEmptyTrips(success.data);
//          TODO: no need for this function - should be included in each object already (via db?)
          }, function(err){
           console.log(err);
          })
      }

      $scope.addTrip = function(departureCaltrainStop, arrivalStation){
        userService.addTrip(departureCaltrainStop, arrivalStation);
      }


      caltrainDataService.getSouthboundStations().then(
        function(success){
          $scope.southboundStations = success.data;
          setStations($scope.southboundStations)
        }, function(err){
          console.log(err);
        })

      //TODO: get NB stations after page load
      caltrainDataService.getNorthboundStations().then(
        function(success){
          $scope.northboundStations = success.data;
        }, function(err){
          console.log(err);
        })


      function setStations(stations){
        $scope.stations = stations;
        $scope.departureStation = stations[0];
//        $scope.arrivalStation = stations[stations.length - 1]
      }

      function removeEmptyTrips(caltrainTrips){
        var trips = [];
        for (var trip in caltrainTrips){
          if (caltrainTrips[trip]['stops'].length > 0){
            trips.push(caltrainTrips[trip])
          }
        }
        return trips
      }

//      inParentState;
//
//      function inParentState(){
//        console.log($state);
//      }
    });
