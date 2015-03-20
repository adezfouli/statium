'use strict';
/*jshint maxdepth:6 */

angular.module('contrasts', [])

    .config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
        $routeProvider.when('/contrasts', {
            templateUrl: 'engine/contrasts/contrasts.tpl.html',
            controller: 'ContrastsCtrl'
//            resolve: {admin: securityAuthorizationProvider.requireAuthenticatedUser}
        });
    }])

    .factory('contrastData', ['spreadsheet_interface', function (spreadsheet_interface) {


    var contrastData = {betweens: [], withins: [], withinFactors: [], betweenFactors: []};

        var loadSampleContrast = function () {
            contrastData.withins =
                [
                    {'b1': 3,
                        'b2': -1,
                        'b3': -1,
                        'b4': -1},

                    {'b1': 0,
                        'b2': 2,
                        'b3': -1,
                        'b4': -1},

                    {'b1': 0,
                        'b2': 0,
                        'b3': 1,
                        'b4': -1}


                ];

            contrastData.betweens =
                [
                    {'1': 1,
                        '2': 1,
                        '3': -2},
                    {'1': 1,
                        '2': -1,
                        '3': 0}
                ];
            contrastData.withinFactors =  ['b1', 'b2', 'b3', 'b4'];
            contrastData.betweenFactors = ['1', '2', '3'];

        };


        contrastData.syncWithSpreadSheet = function () {
            var sWithin = spreadsheet_interface.getWithin();
            var sBetween = spreadsheet_interface.getBetween();
            if (this.withinFactors !== null){
                if (sWithin.length !== this.withinFactors.length){
                    this.withins  = [];
                }else{
                    for (var i = 0; i < sWithin.length; i++){
                        if (this.withinFactors.indexOf(sWithin[i]) === -1){
                            this.withins  = [];
                        }
                    }
                }
            }
            if (this.betweenFactors !== null){
                if (sBetween.length !== this.betweenFactors.length){
                    this.betweens  = [];
                }else{
                    for (var j = 0; j < sBetween.length; j++){
                        if (this.betweenFactors.indexOf(sBetween[j]) === -1){
                            this.betweens  = [];
                        }
                    }
                }
            }
            this.withinFactors = sWithin;
            this.betweenFactors = sBetween;
        };

        contrastData.loadSampleContrast = loadSampleContrast;
        return contrastData;
    }]).

    directive('contrastInput', ['localizedMessages', function (localizedMessages) {
        return {

            restrict: 'E',
            templateUrl: 'engine/contrasts/contrasts-input.tpl.html',
            scope: {
                factors: '=factors',
                model: '=model',
                symbol: '=symbol'
            },

            link: function (scope, elm, attrs) {
                scope.localizedMessages = localizedMessages;
                scope.newContrastItem = {};
                var arraySize = scope.factors.length;
                while (arraySize--) {
                    scope.newContrastItem[scope.factors[arraySize]] = 0;
                }

                scope.addItem = function () {
                    scope.model.push(scope.newContrastItem);
                    scope.newContrastItem = [];
                    var arraySize = scope.factors.length;
                    while (arraySize--) {
                        scope.newContrastItem[scope.factors[arraySize]] = 0;
                    }
                };
                scope.deleteItem = function (item) {
                    var index = scope.model.indexOf(item);
                    if (index > -1) {
                        scope.model.splice(index, 1);
                    }
                };

                scope.addDisabled = function () {
                    for (var c in scope.newContrastItem) {
                        if (scope.newContrastItem[c] !== 0) {
                            return false;
                        }
                    }
                    return true;
                };
            }

        };
    }]);