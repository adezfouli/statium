'use strict';

angular.module('login', ['security.service', 'services.localizedMessages'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
        templateUrl:'security/login/login.tpl.html',
        controller:'LoginCtrl'
    });
}]).
directive('loginToolbar', ['$location', 'security', 'localizedMessages', 'securityRetryQueue', function ($location, security, localizedMessages, queue) {
    return {

        templateUrl: 'security/login/login-toolbar.tpl.html',

        link: function ($scope, elm, attrs) {
            $scope.user = {};
            $scope.authError = null;
            $scope.login = function () {
                $scope.authError = null;
                security.login($scope.user.email, $scope.user.password, $scope.rememberMe).then(function (result) {
                    if (!result.loggedIn) {
                        $scope.authError = "Login failed.  Please check your credentials and try again.";
                    }else{
                        queue.retryAll();
                        result.redirectPath = result.redirectPath || '/';
                        $location.path(result.redirectPath);
                    }
                });
            };

            $scope.password_request = function(){
                $location.path("/forget-password" );
            };
            $scope.register = function(){
                $location.path("/register" );
            };
        }
    };
}])


.controller('LoginCtrl', ['$scope', '$location', 'security', 'localizedMessages', 'securityRetryQueue', function ($scope, $location, security, localizedMessages, queue) {
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function () {
        $scope.authError = null;
        security.login($scope.user.email, $scope.user.password, $scope.rememberMe).then(function (result) {
            if (!result.loggedIn) {
                $scope.authError = "Login failed.  Please check your credentials and try again.";
            }else{
                queue.retryAll();
                result.redirectPath = result.redirectPath || '/';
                $location.path(result.redirectPath);
            }
        });
    };

    $scope.register = function(){
        $location.path("/register" );
    };

    $scope.password_request = function(){
        $location.path("/forget-password" );
    };

        $scope.cancel = function(){
            queue.cancelAll();
            $location.path('/');

        };


}
]);