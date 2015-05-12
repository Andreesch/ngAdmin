

angular.module('navigation', [])

.directive('navLayout', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        function open() {
          $element.removeClass('minify');
          angular.element(document.body).addClass('show-nav');
        }

        function close() {
          $element.addClass('minify');
          angular.element(document.body).removeClass('show-nav');
        }

        $rootScope.$on('layout.toggle.navigation', function(event, isOpen) {
          $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
          $scope.isOpen ? open() : close();
        });

        $scope.isOpen = !!$attrs.open;
        $scope.isOpen ? open() : close();
      }
    };
  }
])

.controller('NavController', [
  '$scope', '$http', '$route', '$location',
  'NAVIGATION',
  function($scope, $http, $route, $location, NAVIGATION) {
    var exports = this;

    $scope.navigations = NAVIGATION;
    $scope.current = '';
    $scope.filter = '';

    exports.reload = function() {
      var i = 0,
      paths = $location.$$path.replace(/^\//, '').replace(/\/$/, '').split('\/'),
      index;

      for (; i < $scope.navigations.length; i ++) {
        index = angular.inArrayBy(paths[1] || paths[0], $scope.navigations[i].child || [], 'key');
        if (-1 !== index) {
          $scope.current = [$scope.navigations[i].key, paths[1] || paths[0]];
          break;
        }
      }
    };

    exports.filter = function(str) {
      var regexp = new RegExp(str, 'ig');

      angular.forEach($scope.navigations, function(nav) {
        if (angular.isArray(nav.child)) {
          nav.hidden = true;
          nav.open = false;

          angular.forEach(nav.child, function(item) {
            if (!item.name.match(regexp)) item.hidden = true;
            else {
              nav.open = true;
              nav.hidden = item.hidden = false;
            }
          });
        }
        else nav.hidden = !nav.name.match(regexp);
      });
    };

    $scope.$watch('filter', function(filter) {
      exports.filter(filter)
    });
    
    $scope.$on('$routeChangeSuccess', exports.reload);
    exports.reload();
  }
])