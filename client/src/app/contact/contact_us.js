'use strict';

angular.module('contact_us', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/contact-us', {
            templateUrl: 'contact/contact-us.tpl.html',
            controller: 'ContactUsCtrl'
        });
    }])

    .controller('ContactUsCtrl', ['$scope', '$http','i18nNotifications', 'localizedMessages',
        function ($scope, $http, i18nNotifications, localizedMessages) {
            $scope.user = {};
            $scope.wait = false;
            $scope.localizedMessages = localizedMessages;
            $scope.submitted = false;
            $scope.submit = function(){

                $scope.submitted = true;

                if ($scope.form.$valid){

                $scope.wait = true;
                var request = $http.post('/api/user_service/contact-us', $scope.user);
                return request.then(function (response) {
                    $scope.wait = false;
                    $scope.user = {};
                    i18nNotifications.pushForCurrentRoute("MESSAGE_SENT_SUCCESSFULLY", "info", null);

                }, function (response) {
                    $scope.wait = false;
                    i18nNotifications.pushForCurrentRoute("ERROR_IN_MESSAGE_SENDING", "danger", null);
                });
                }
            };

            $scope.showError = function(name){
                return $scope.form[name].$invalid && (!$scope.form[name].$pristine || $scope.submitted);
            };

        }]);
