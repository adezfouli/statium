'use strict';

/*jshint maxdepth:6 */

angular.module('services.descriptive', []);
angular.module('services.descriptive').factory('descriptive', [function () {

    /// number of datapoints
    var _numData;

    /// number of groups
    var _numGroup;

    /// total data for each feature for all data points
    var _data;

    /// number of data-points in each group Map<String, int>
    var _numDataGroup;

    /// number of data-points for each feature in each group Map<String, Map<String, int>>
    var _NFeatureGroup;

    /// sum of data points for each group for each feature Map<String, Map<String, double>>
    var _SFeatureGroup;

    /// mean of data points for each group for each feature Map<String, Map<String, double>>
    var _MFeatureGroup;

    /// standard deviation
    var _VAR_FeatureGroup = {};

    /// SEM of the feature group
    var _SEM_FeatureGroup = {};


///////////// helper functions ///////////
    var sqr = function (x) {
        return x * x;
    };


    var _calculateGroupData = function () {
        _numDataGroup = {};
        var groupSet = {};

        _numGroup = 0;
        for (var i = 0; i < _data.group.length; i++) {
            if (!( _data.group[i] in _numDataGroup)){_numDataGroup[_data.group[i]] = 0;}
            _numDataGroup[_data.group[i]] += 1;
            if (!(_data.group[i] in groupSet)) {
                _numGroup++;
                groupSet[_data.group[i]] = "";
            }
        }
    };

    var _calculateMeanOfFeatureGroup = function () {

        _SFeatureGroup = {};
        _NFeatureGroup = {};


        var i, f;
        for (f in _data) {
            if (f !== 'group') {
                _SFeatureGroup[f] = {};
                _NFeatureGroup[f] = {};
                for (i = 0; i < _data.group.length; i++) {
                    if (!(_data.group[i] in _SFeatureGroup[f])){_SFeatureGroup[f][_data.group[i]] = 0;}
                    _SFeatureGroup[f][_data.group[i]] += _data[f][i];
                    if (!(_data.group[i] in _NFeatureGroup[f])){_NFeatureGroup[f][_data.group[i]] = 0;}
                    _NFeatureGroup[f][_data.group[i]] += 1;
                }

            }

        }

        _MFeatureGroup = {};
        for (var feature  in _SFeatureGroup) {
            if (_SFeatureGroup.hasOwnProperty(feature)){
                var groupMap = _SFeatureGroup[feature];
                for (var group in groupMap) {
                    if (groupMap.hasOwnProperty(group)){
                        var sum = groupMap[group];
                        if (!(feature in _MFeatureGroup)){
                            _MFeatureGroup[feature] = {};
                        }

                        _MFeatureGroup[feature][group] = sum / _NFeatureGroup[feature][group];
                    }
                }
            }

        }

        for (f in _data) {
            if (f !== 'group') {
                _SEM_FeatureGroup[f] = {};
                _VAR_FeatureGroup[f] = {};
                for (i = 0; i < _data.group.length; i++) {
                    if (!(_data.group[i] in _VAR_FeatureGroup[f])){_VAR_FeatureGroup[f][_data.group[i]] = 0;}
                    _VAR_FeatureGroup[f][_data.group[i]] += sqr(_data[f][i] - _MFeatureGroup[f][_data.group[i]]) / (_NFeatureGroup[f][_data.group[i]] - 1);
                }

            }

        }

    };



// interface methods

    var dInterface = {};

    dInterface.setData = function (data) {
        _data = data;
        _numData = _data.group.length;

        _calculateGroupData();
        _calculateMeanOfFeatureGroup();

    };

    dInterface.getMeanOfFeatureGroup = function (f, g) {
        return _MFeatureGroup[f][g];
    };

    dInterface.getSDFeatureGroup = function (f, g) {
        return Math.sqrt(_VAR_FeatureGroup[f][g]);
    };

    dInterface.getSEMOfFeatureGroup = function (f, g) {
        return this.getSDFeatureGroup(f, g) / Math.sqrt(_NFeatureGroup[f][g]);
    };

    return dInterface;
}]);