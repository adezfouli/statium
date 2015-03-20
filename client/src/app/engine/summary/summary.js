'use strict';

/*jshint maxdepth:6 */
/*global SpreadsheetException */


angular.module('summary', ['services.spreadsheet', 'contrasts', 'services.descriptive'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/summary', {
            templateUrl: 'engine/summary/summary.tpl.html',
            controller: 'SummaryCtrl'
        });
    }])

    .controller('SummaryCtrl',
        [ '$scope', 'descriptive', 'spreadsheet_interface', 'localizedMessages',
            function ($scope, descriptive, sInterface, localizedMessages) {
                try {
                    $scope.localizedMessages = localizedMessages;
                    $scope.within = sInterface.getWithin();
                    $scope.between = sInterface.getBetween();
                    descriptive.setData(sInterface.getData());
                    $scope.descriptive = descriptive;
                } catch (e) {
                    if (e instanceof SpreadsheetException) {
                        sInterface.handleError(e);
                    } else {
                        throw e;
                    }
                }

            }
        ]);

