'use strict';

/*global google */
/*jshint maxdepth:6 */


angular.module('visualize', ['services.spreadsheet', 'contrasts', 'services.descriptive'])

    .directive('visualize',
        [
            function () {
                return {
                    scope: {
                        descriptive: '=descriptive',
                        withins: '=withins',
                        betweens: '=betweens',
                        chart_type: '=chartType'

                    },
                    link: function ($scope, elm, attrs) {

                        function drawChart(withins, betweens, descriptive, type) {

                            var data = new google.visualization.DataTable();
                            data.addColumn('string', 'groups'); // Implicit domain column.
                            for (var b in betweens){
                                if(betweens.hasOwnProperty(b)){
                                data.addColumn('number', betweens[b]); // Implicit domain column.
                                data.addColumn({type: 'number', role: 'interval'});
                                data.addColumn({type: 'number', role: 'interval'});
                                }

                            }

                            for (var w in withins) {
                                if (withins.hasOwnProperty(w)) {
                                    var row = [withins[w]];
                                    for (b in betweens) {
                                        if (betweens.hasOwnProperty(b)) {
                                            row = row.concat(descriptive.getMeanOfFeatureGroup(withins[w], betweens[b]));
                                            row = row.concat(descriptive.getMeanOfFeatureGroup(withins[w], betweens[b]) -
                                                descriptive.getSEMOfFeatureGroup(withins[w], betweens[b]));
                                            row = row.concat(descriptive.getMeanOfFeatureGroup(withins[w], betweens[b]) +
                                                descriptive.getSEMOfFeatureGroup(withins[w], betweens[b]));
                                        }
                                    }
                                    data.addRow(row);
                                }
                            }

                            var options = {
                                hAxis: {title: 'measurement'},
                                orientation: 'horizontal',
                                lineWidth: 3,
                                pointSize: 3,
                                intervals: { style: 'sticks' } // Use line intervals.
                            };
                            var chart;
                            if (type === 'bar'){
                                chart = new google.visualization.BarChart(elm[0]);
                            }
                            if (type === 'line'){
                                chart = new google.visualization.LineChart(elm[0]);
                            }

                            chart.draw(data, options);
                        }

                        drawChart($scope.withins, $scope.betweens, $scope.descriptive, $scope.chart_type);

                    }
                };
            }

        ]);

