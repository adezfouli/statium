'use strict';

angular.module('app')

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/help', {
            templateUrl: 'static_pages/help/help.tpl.html',
            controller:'HelpCtrl'
        });
    }])

    .controller('HelpCtrl', ['spreadsheet_interface', 'i18nNotifications', 'contrastData', '$scope', '$location',
    function (spreadsheet_interface, i18nNotifications, contrastData, $scope, $location) {
            $scope.loadSampleData = function(){
                spreadsheet_interface.loadSampleData();
                contrastData.loadSampleContrast();
                i18nNotifications.pushForCurrentRoute('DATA_LOADED_SUCCESSFULLY', "info", null);
            };
    }]);
