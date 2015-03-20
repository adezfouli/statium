'use strict';

angular.module('app')

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/about', {
            templateUrl: 'static_pages/about_us/about.tpl.html'
        });
    }]);