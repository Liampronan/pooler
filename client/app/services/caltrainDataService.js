angular.module('hitcher')
    .service('caltrainDataService', ['$http', '$stateParams', '$q', '$location',
      function ($http, $stateParams, $q, $location) {

        this.getSouthboundStations = function(){
            return $http.get('/api/caltrainData/southboundStations')
        };

        this.getNorthboundStations = function(){
          return $http.get('/api/caltrainData/northboundStations')
        };

        this.getTrips = function(departureStation, arrivalStation){
          var departureStopId = departureStation.stopId;
          var arrivalStopId = arrivalStation.stopId;

          return $http.get('/api/caltrainData/getTrips?departureStopId=' + departureStopId + '&arrivalStopId=' +
              arrivalStopId)
        }

      }
    ])