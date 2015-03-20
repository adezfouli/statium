'use strict';
/*global $:false */
/*global window */
/*global Handsontable */

angular.module('directives.spreadsheet', ['services.spreadsheet']).directive('spreadsheet', [ 'spreadsheet_interface', '$timeout',
    function (sInterface, $timeout) {
    return {
        link: function (scope, elm, attrs) {

            $timeout(function(){$timeout(function(){

            var availableWidth;
            var availableHeight;
            var $window = $(window);
            var $example1 = elm;

            var calculateSize = function () {
                var offset = $example1.offset();
                availableWidth = $window.width() - offset.left ;
                availableHeight = $window.height() - offset.top ;
            };
            $window.on('resize', calculateSize);

            function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
                /*jshint validthis:true */
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                td.style.fontWeight = 'bold';
                td.style.color = 'green';
                td.style.background = '#CEC';
            }

            var readonlyRenderer = function (instance, td, row, col, prop, value, cellProperties) {
                $(td).css({
                    background: '#000000'
                });
            };

            function negativeValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                cellProperties.type = "numeric";
                cellProperties.format = "0.00";

                /*jshint validthis:true */
                Handsontable.renderers.NumericRenderer.apply(this, arguments);
            }


            $example1.handsontable({
                minCols: 20,
                minRows: 80,
                colWidths: 100, //can also be a number or a function
                colHeaders: false,
                minSpareRows: 1,
                stretchH: 'all',
                contextMenu: true,
                allowInvalid: false,
                width: function () {
                    if (availableWidth === void 0) {
                        calculateSize();
                    }
                    return availableWidth;
                },
                height: function () {
                    if (availableHeight === void 0) {
                        calculateSize();
                    }
                    return availableHeight;
                },
                cells: function (row, col, prop) {

                    if (row === 0 && col === 0) {
                        this.renderer = readonlyRenderer;
                        this.readOnly = true;
                    }
                    else if (row === 0 || col === 0) {
                        this.renderer = firstRowRenderer; //uses function directly
                    }
                    else {
                        this.renderer = negativeValueRenderer;
                    }
                },

                rowHeaders:  function(index) {
                    if (index === 0){
                        return '';
                    }else{
                        return index;
                    }
                }
            });

            sInterface.getColData = function (col) {
                var filledRows = -elm.handsontable('countEmptyRows', true) + elm.handsontable('countRows');
                if (filledRows === 0) {
                    return [];
                }
                return elm.handsontable('getDataAtCol', col).slice(1, filledRows);
            };

            sInterface.getRowData = function (row) {
                var filledCols = -elm.handsontable('countEmptyCols', true) + elm.handsontable('countCols');
                if (filledCols === 0) {
                    return [];
                }

                return elm.handsontable('getDataAtRow', row).slice(1, filledCols);
            };

            $example1.handsontable('render');

            sInterface.loadSampleData = function () {
                var test_data = [
                    ['', 'b1', 'b2', 'b3', 'b4'],
                    ['1', 22, 37, 34, 31],
                    ['1', 18, 31, 28, 31],
                    ['1', 21, 29, 28, 26],
                    ['1', 9, 32, 31, 28],
                    ['1', 13, 28, 28, 27],
                    ['1', 15, 36, 20, 25],
                    ['1', 13, 22, 34, 27],
                    ['1', 14, 25, 23, 26],
                    ['1', 10, 27, 25, 22],
                    ['1', 5, 23, 19, 17],
                    ['2', 25, 41, 29, 25],
                    ['2', 20, 28, 26, 22],
                    ['2', 17, 29, 21, 25],
                    ['2', 17, 27, 18, 22],
                    ['2', 22, 25, 19, 15],
                    ['2', 11, 33, 23, 19],
                    ['2', 13, 25, 19, 23],
                    ['2', 16, 24, 15, 21],
                    ['2', 11, 27, 20, 14],
                    ['2', 8, 21, 10, 14],
                    ['3', 25, 23, 25, 23],
                    ['3', 19, 19, 18, 16],
                    ['3', 16, 16, 18, 18],
                    ['3', 18, 18, 16, 12],
                    ['3', 12, 14, 20, 14],
                    ['3', 16, 14, 12, 18],
                    ['3', 15, 19, 13, 9],
                    ['3', 12, 8, 16, 16],
                    ['3', 9, 11, 13, 7],
                    ['3', 8, 8, 9, 7]
                ];
                elm.handsontable('loadData', test_data);

            };
                // TODO fix is latter on
            }, 1000);},1000);

        }
    };
}]);