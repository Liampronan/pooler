angular
  .module('pooler')
  .directive('tripMatch', tripMatch);

function tripMatch(){
  var directive = {
    link: link,
    templateUrl: 'matches/templates/tripMatch.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
