'use strict';

function SpreadsheetException(message, parameters) {
    this.message = message;
    this.parameters = parameters;
}

angular.module('services.spreadsheet', [])
    .config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/data', {
                controller: 'SpreadsheetCtrl',
                template: ''

            });
    }])

    .controller('SpreadsheetCtrl', ['$scope', '$location', function($scope, $location){
        $scope.showSpreadsheet = function(){
            return $location.url() === '/data';
        };


    }]).

    factory('spreadsheet_interface', ['i18nNotifications', 'I18N.MESSAGES', '$location',
        function (i18nNotifications, I18N_MESSAGES, $location) {
    var sInterface  = {};



    sInterface.getBetween = function(){
        var groupsCol  = this.getColData(0);
        var groups = {};
        var groupList = [];
        for (var g in groupsCol){
            if (groupsCol.hasOwnProperty(g)){
            if (!(groupsCol[g] in groups)){
                groupList.push(groupsCol[g]);
                groups[groupsCol[g]] = " ";
            }
            if (groupsCol[g] === null || !groupsCol[g]){
                throw new SpreadsheetException('GROUP_CANNOT_BE_NULL', {row: (parseInt(g, 10) + 1)});
            }
            }
        }
        return groupList;
    };


    sInterface.getWithin = function(){
        var groupsCol  = this.getRowData(0);
        var groups = {};
        var groupList = [];
        for (var g in groupsCol){
            if (groupsCol[g] in groups){
                throw new SpreadsheetException('DUPLICATE_WITHIN_FACTOR', {factor: (groupsCol[g])});
            }
            else if (groupsCol[g] === null || !groupsCol[g]){
                throw new SpreadsheetException('WITHIN_FACTOR_CANNOT_BE_NULL', {col: (parseInt(g, 10) + 1)});
            }
            else{
                groups[groupsCol[g]] = "";
                groupList.push(groupsCol[g]);
            }
        }
        return groupList;
    };

    sInterface.getData = function(){
        var data = {};

        data.group = this.getColData(0);
        //checking group constrains
        for (var g in data.group){

            if (data.group[g] === null || !data.group[g]){
                throw new SpreadsheetException('GROUP_CANNOT_BE_NULL', {row: (parseInt(g, 10) + 1)});
            }
        }


        var  factors  = this.getRowData(0);
        //checking within factor constrains
        var factorList = {};
        for (var f in factors){
            if (factors[f] in factorList){
                throw new SpreadsheetException('DUPLICATE_WITHIN_FACTOR', {factor: (factors[f])});
            }
            else if (factors[f] === null || !factors[f]){
                throw new SpreadsheetException('WITHIN_FACTOR_CANNOT_BE_NULL', {col: (parseInt(f, 10) + 1)});
            }
            else{
                factorList[factors[f]] = "";
            }
        }



        for (var i = 0; i < factors.length; i++){
            var colData = this.getColData(i+1);
            for(var j=0;j<colData.length;j++){
                if(colData[j] === null || colData[j] === ""){
                    throw new SpreadsheetException('EMPTY_DATA_POINT', {factor: factors[i], row: (parseInt(j, 10)+1)});
                }
            }
            data[factors[i]] = colData;
        }

        return data;
    };

    sInterface.handleError = function(e){
        i18nNotifications.pushForNextRoute(e.message, "danger", e.parameters);
        $location.path('/data');
    };

    return sInterface;

}]);