angular
  .module('pooler')
  .directive('noMatches', noMatches);

function noMatches(){
  var directive = {
    link: link,
    templateUrl: 'matches/templates/noMatches.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
