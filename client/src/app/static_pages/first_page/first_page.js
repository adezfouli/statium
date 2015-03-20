'use strict';

angular.module('app')

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'static_pages/first_page/first_page.tpl.html'
        });
    }]);