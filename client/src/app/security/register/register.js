'use strict';
/*global Recaptcha */

angular.module('security.register', ['services.localizedMessages'])

    .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/register', {
        templateUrl:'security/register/register.tpl.html',
        controller:'RegisterCtrl'
    });
}])

    .controller('RegisterCtrl', ['$scope', '$location', 'security', 'i18nNotifications', '$http', function ($scope, $location, security, i18nNotifications, $http) {
    $scope.user = {};

        $scope.wait = false;

        $scope.formErrors = {};

        $scope.onError = function (response) {

            $scope.authError = response.data.messages;

            if (response.status === 422) {

                $scope.formErrors = {};
                angular.forEach(response.data.errors, function (value, key) {
                    $scope.formErrors[key] = value[0];
                });
            } else {
                console.log("error happend in back end");
                //TODO add error handler

            }
        };

        $scope.getError = function (name) {
            return $scope.formErrors[name];
        };
    $scope.submit = function (response) {
        Recaptcha.reload();
        $scope.wait  = true;
        $scope.authError = null;
        $http.post('/api/register', {user: $scope.user, recaptcha_challenge_field: Recaptcha.get_challenge(), recaptcha_response_field: Recaptcha.get_response()}).then(function () {
            i18nNotifications.pushForNextRoute("REGISTRATION_SUCCESSFUL", "info", null);
            $location.path('/login');

        },
        function(response){
            $scope.onError(response);
            $scope.wait = false;

        }
        );
    };
}
])

    .directive('recaptcha',
    [
        function () {
            return {
                link: function (scope, elm, attrs) {
                    Recaptcha.create("6LdYse8SAAAAANpK79LvUUoTGkeRoXjb9t9QvZT1",
                        elm[0],
                        {
                            theme: "red",
                            callback: Recaptcha.focus_response_field
                        }
                    );

                }
            };
        }

    ]);


