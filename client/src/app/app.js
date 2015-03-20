'use strict';

/*global google */
/*global document */

angular.module('app', [
    'ngRoute',
    'security',
    'login',
    'services.breadcrumbs',
    'services.i18nNotifications',
    'services.httpRequestTracker',
    'services.i18nConstants',
    'templates.app',
    'templates.common',
    'services.anova',
    'services.spreadsheet',
    'directives.spreadsheet',
    'contrasts',
    'report',
    'visualize',
    'summary',
    'ui.bootstrap',
    'contact_us',
    'security.register',
    'security.forget_password'

]
);

angular.module('app').constant('SERVER_CONFIG', {
    baseUrl:'/api/'
});


angular.module('app').config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.otherwise({redirectTo:'/'});
    $httpProvider.responseInterceptors.push('internalServerErrorHandler');

}]);


google.load("visualization", "1", {packages:['corechart']});
google.setOnLoadCallback(function () {

    /* jshint ignore:start */

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-50623353-1', 'statium.herokuapp.com');

    /* jshint ignore:end */

    angular.bootstrap(document.body, ['app']);

});

angular.module('app').controller('AppCtrl', ['$location', '$scope', 'i18nNotifications','security', '$window',
    function ($location, $scope, i18nNotifications, security, $window) {


    $scope.notifications = i18nNotifications;

    $scope.removeNotification = function (notification) {
        i18nNotifications.remove(notification);
    };

    $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
        i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'danger', {}, {rejection:rejection});
    });

    $scope.isAuthenticated = security.isAuthenticated;

    $scope.$on('$viewContentLoaded', function(event) {
        $window.ga('send', 'pageview', { page: $location.path() });    });

}]);


angular.module('app').run(['security', '$location', function(security, $location) {
    $location.path('/data');
    security.requestCurrentUser();
}]);

angular.module('app').factory('internalServerErrorHandler', ['i18nNotifications', function(i18nNotifications) {
    return function(promise) {
        // Intercept failed requests
        return promise.then(null, function(originalResponse) {
            if(originalResponse.status === 500) {
                i18nNotifications.pushForCurrentRoute('INTERNAL_SERVER_ERROR', 'danger');
            }
            return promise;
        });
    };
}]) ;


