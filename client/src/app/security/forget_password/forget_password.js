'use strict';

angular.module('security.forget_password', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/forget-password', {
            templateUrl: 'security/forget_password/forget_password.tpl.html',
            controller: 'ForgetPasswordCtrl'
        });
    }])

    .controller('ForgetPasswordCtrl', ['$scope', '$http','i18nNotifications', '$location',
        function ($scope, $http, i18nNotifications, $location) {
            $scope.error = null;
            $scope.user = {};
            $scope.wait = false;
            $scope.submit = function(){
                $scope.wait = true;
                var request = $http.post('/api/password_request', $scope.user);
                return request.then(function (response) {
                    $scope.wait = false;
                    $scope.user = {};
                    i18nNotifications.pushForNextRoute("PASSWORD_SENT_TO_EMAIL", "info", null);
                    $location.path('/login');
                }, function (response) {
                    $scope.wait = false;
                    if (response.status === 422) {
                        $scope.error = response.data.messages;
                    }

                });
            };
        }]);
