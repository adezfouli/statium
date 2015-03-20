'use strict';

angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'breadcrumbs', 'i18nNotifications', 'httpRequestTracker', 'security',
    function ($scope, $location, $route, breadcrumbs, i18nNotifications, httpRequestTracker, security) {
    $scope.location = $location;
    $scope.breadcrumbs = breadcrumbs;

    $scope.isAuthenticated = security.isAuthenticated;
    $scope.isLoaded = security.isLoaded;

    $scope.isNavbarActive = function (navBarPath) {
        return navBarPath === breadcrumbs.getFirst().name;
    };

    $scope.hasPendingRequests = function () {
        return httpRequestTracker.hasPendingRequests();
    };

    $scope.logout = function(){
        security.logout();
    };

    $scope.login = function(){
        $location.path('/login');
    };


    $scope.data = function(){
        $location.path('/data');
    };

    $scope.summary = function(){
        $location.path('/summary');
    };

    $scope.analyze = function(){
        $location.path('/analyze');
    };

    $scope.showRoute = function(){
        return $location.url();
    };

    $scope.isActive = function(x){
        return $location.url() === x;
    };

    $scope.contact_us = function(){
        $location.path('/contact-us');
    };

        $scope.about = function(){
            $location.path('/about');
        };

        $scope.help = function(){
            $location.path('/help');
        };



    }]);
