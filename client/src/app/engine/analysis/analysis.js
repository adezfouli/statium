'use strict';
/*global SpreadsheetException */

angular.module('report', [])

    .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyze', {
        templateUrl:'engine/analysis/analysis.tpl.html',
        controller:'AnalysisCtrl'

    });
}])

    .controller('AnalysisCtrl', ['spreadsheet_interface', 'i18nNotifications', 'contrastData', '$scope', '$location', 'anova', 'localizedMessages',
    function (spreadsheet_interface, i18nNotifications, contrastData, $scope, $location, anova, localizedMessages) {
        $scope.show = false;
        try {
            $scope.showContrasts = true;
            $scope.showAnalysis = false;
            $scope.localizedMessages = localizedMessages;
            contrastData.syncWithSpreadSheet();
            $scope.contrastData = contrastData;
            $scope.withins = contrastData.withinFactors;
            $scope.betweens = contrastData.betweenFactors;
            $scope.show = true;
            $scope.anova = anova;
            $scope.analyze = function () {
                anova.setData(spreadsheet_interface.getData(), contrastData.withinFactors, contrastData.betweenFactors,
                    contrastData.withins, contrastData.betweens);
                $scope.showContrasts = false;
                $scope.showAnalysis = true;

            };


//            var validateContrast = function(contrast){
//                var valid = false;
//                for (var f in contrast) {
//                    if (f !== '$$hashKey' && contrast.hasOwnProperty(f)) {
//                        if (contrast[f] !== 0) {
//                            valid = true;
//                        }
//
//                    }
//                }
//                return valid;
//
//            };

//            var validateContrastList = function (contrasts) {
//                for (var i = 0; i < contrasts.length; i++) {
//                    if (!validateContrast(contrasts[i])){
//                        return false;
//                    }
//                }
//                return true;
//            };


        } catch (e) {
            if (e instanceof SpreadsheetException) {
                spreadsheet_interface.handleError(e);
            } else {
                throw e;
            }
        }

    }]);
