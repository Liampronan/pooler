angular
  .module('pooler')
  .directive('newTrip', editTrip);

function editTrip(){
  var directive = {
    link: link,
    templateUrl: 'dash/templates/editTrip.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
