'use strict';

/*jshint maxdepth:6 */

angular.module('services.anova', []);
angular.module('services.anova').factory('anova', [function () {

    /// number of datapoints
    var _numData;

    /// number of groups
    var _numGroup;

    /// critical value for f-test
    var _F_critic;

    /// mean of standard deviation for whole data
    var _meanSD;

    /// total data for each feature for all data points
    var _data;

    /// sum of weighted data by contrasts List<List<double>>
    var _SNConstratData;

    /// number of data-points in each group Map<String, int>
    var _numDataGroup;

    /// number of data-points for each feature in each group Map<String, Map<String, int>>
    var _NFeatureGroup;

    /// sum of data points for each group for each feature Map<String, Map<String, double>>
    var _SFeatureGroup;

    /// mean of data points for each group for each feature Map<String, Map<String, double>>
    var _MFeatureGroup;

    /// within contrasts List<Map<String, double>>
    var _WContrast; // set of maps of features to contrasts

    /// within contrasts List<Map<String, double>>
    var _BContrast; // set of maps of features to contrasts

    var _InputBContrasts;

    var _InputWContrasts;

    /// normalized within contrasts List<Map<String, double>>
    var _NWContrast; // set of maps of features to contrasts

    /// sum of normalized data for each group for each contrast List<Map<String, double>>
    var _SNContrastGroup;

    /// sum of normalized features averaged on groups for each within contrast List<Map<String, double>>
    var _SNFeatureOnGroupWContrast;

    /// sampleValue for between by within List<List<double>>
    var _sampleValue;

    /// sum of square for between by within List<List<double>>
    var _SS;

    /// sum of square for between by within List<List<double>>
    var _SE;

    /// sum of square for each feature group Map<String, Map<String, double>>
    var _SSFeatureGroup;

    /// sum of square within constrats for each group Map<String, double>
    var _SSWithinGroups;

    /// sum of saquare error for within contrasts List<double>
    var _SSEWContrast;

///////////// helper functions ///////////
    var sqr = function (x) {
        return x * x;
    };

    var abs = function (x) {
        return x > 0 ? x : -x;
    };


    var FProbability = function (F, df1, df2) {

        var i, j;
        var a, b;
        var w, y, z, d, p;

        if ((abs(F) < 10e-10) || df1 <= 0 || df2 <= 0) {
            return 1.0;
        }
        a = (df1 % 2 === 1) ? 1 : 2;
        b = (df2 % 2 === 1) ? 1 : 2;
        w = (F * df1) / df2;
        z = 1.0 / (1.0 + w);
        if (a === 1) {
            if (b === 1) {
                p = Math.sqrt(w);
                y = 1 / Math.PI;
                /* 1 / 3.14159 */
                d = y * z / p;
                p = 2.0 * y * Math.atan(p);
            } else {
                p = Math.sqrt(w * z);
                d = 0.5 * p * z / w;
            }
        } else if (b === 1) {
            p = Math.sqrt(z);
            d = 0.5 * z * p;
            p = 1.0 - p;
        } else {
            d = z * z;
            p = w * z;
        }
        y = 2.0 * w / z;
        for (j = b + 2; j <= df2; j += 2) {
            d *= (1.0 + a / (j - 2.0)) * z;
            p = (a === 1 ? p + d * y / (j - 1.0) : (p + w) * z);
        }
        y = w * z;
        z = 2.0 / z;
        b = df2 - 2;
        for (i = a + 2; i <= df1; i += 2) {
            j = i + b;
            d *= y * j / (i - 2.0);
            p -= z * d / j;
        }

        // correction for approximation errors suggested in certification
        if (p < 0.0) {
            p = 0.0;
        }
        else if (p > 1.0) {
            p = 1.0;
        }
        return (1.0 - p);
    };

    /**
     * Critical value for given probability of F-distribution.
     * Adapted from unixstat by Gary Perlman.
     *
     * @param p the probability
     * @param df1 the first number of degrees of freedom
     * @param df2 the second number of degrees of freedom
     * @return the critical value for the given probability
     */
    var FCriticalValue = function (p, df1, df2) {

        var fval;
        var maxf = 99999.0;
        /* maximum possible F ratio */
        var minf = 0.000001;
        /* minimum possible F ratio */

        if (p <= 0.0 || p >= 1.0) {
            return (0.0);
        }

        fval = 1.0 / p;
        /* the smaller the p, the larger the F */

        while (abs(maxf - minf) > 0.000001) {
            if (FProbability(fval, df1, df2) < p) { /* F too large */
                maxf = fval;
            }
            else { /* F too small */
                minf = fval;
            }
            fval = (maxf + minf) * 0.5;
        }

        return fval;
    };
//////////////////////////////////////////


    var _calculateSE = function () {
        _SE = new Array(_BContrast.length);
        _sampleValue = new Array(_BContrast.length);
        for (var bc = 0; bc < _BContrast.length; bc++) {
            _SE[bc] = new Array(_WContrast.length);
            _sampleValue[bc] = new Array(_WContrast.length);
            for (var wc = 0; wc < _WContrast.length; wc++) {
                var sf = _SOfPositiveWcontrasts(wc) * _SOfPositiveBcontrasts(bc);
                _SE[bc][wc] = Math.sqrt(
                    _calculateSSWContrasts(wc) *
                        _calculateMSError(wc) *
                        _calculateSSBContrasts(bc)) / sf;
                var sum = 0;
                for (var group in _SNFeatureOnGroupWContrast[wc]) {
                    if (_SNFeatureOnGroupWContrast[wc].hasOwnProperty(group)) {
                        sum += _SNFeatureOnGroupWContrast[wc][group] * _BContrast[bc][group];
                    }
                }
                _sampleValue[bc][wc] = sum / sf;

            }
        }
    };

    var _getDOF = function () {
        return _numData - _numGroup;
    };

    var _calculateFCriticalValue = function () {
        _F_critic = FCriticalValue(0.05, 1, _getDOF());
    };

    /**
     * calculates sum of square of between contrasts, normalized by number of data points
     */
    var _calculateSSBContrasts = function (bc) {
        var result = 0;
        for (var group in _BContrast[bc]) {
            if (_BContrast[bc].hasOwnProperty(group)) {
                result += sqr(_BContrast[bc][group]) / _numDataGroup[group];
            }
        }
        return result;
    };

    var _calculateMeanSD = function () {
        var sum = 0;
        for (var f in _SSWithinGroups) {
            if (_SSWithinGroups.hasOwnProperty(f)) {
                sum += sqr(_SSWithinGroups[f]);
            }
        }
        _meanSD = Math.sqrt(sum / Object.keys(_SSWithinGroups).length);
    };

    /**
     * calculates sum of square of a within contrast
     */
    var _calculateSSWContrasts = function (wc) {
        var result = 0;
        for (var f in _WContrast[wc]) {
            if (_WContrast[wc].hasOwnProperty(f)) {
                result += sqr(_WContrast[wc][f]);
            }
        }
        return result;
    };


    /**
     * calculates sum of positive within contrasts
     */
    var _SOfPositiveBcontrasts = function (bc) {
        var sum = 0;
        for (var g in _BContrast[bc]) {
            if (_BContrast[bc].hasOwnProperty(g)) {
                var v = _BContrast[bc][g];
                if (v > 0) {
                    sum += v;
                }
            }
        }
        return sum;
    };

    /**
     * calculates sum of positive within contrasts
     */
    var _SOfPositiveWcontrasts = function (wc) {
        var sum = 0;
        for (var f in _WContrast[wc]) {
            if (_WContrast[wc].hasOwnProperty(f)) {
                var v = _WContrast[wc][f];
                if (v > 0) {
                    sum += v;
                }
            }
        }
        return sum;
    };


    /***
     * calculate ss error for each within contrast
     */
    var _calculateSSEWContrast = function () {

        _SSEWContrast = new Array(_WContrast.length);
        for (var wc = 0; wc < _WContrast.length; wc++) {
            var gError = {};
            var total = 0;
            for (var i = 0; i < _SNConstratData[wc].length; i++) {
                var diff = _SNConstratData[wc][i] - _SNContrastGroup[wc][_data.group[i]];
                total += diff * diff;
                if (!(_data.group[i] in gError)) {
                    gError[_data.group[i]] = 0;
                }
                gError[_data.group[i]] += diff;
            }
            for (var group in gError) {
                if (gError.hasOwnProperty(group)) {
                    total -= gError[group] * gError[group] / _numDataGroup[group];
                }
            }
            _SSEWContrast[wc] = total;
        }
    };

    var _calculateMSError = function (wc) {
        return _SSEWContrast[wc] / _getDOF();
    };

    var _calculateSNFeatureOnGroupContrast = function () {
        _SNFeatureOnGroupWContrast = [];

        for (var wc = 0; wc < _WContrast.length; wc++) {
            _SNFeatureOnGroupWContrast.push({});
            for (var f in _MFeatureGroup) {
                if (_MFeatureGroup.hasOwnProperty(f)) {
                    var g = _MFeatureGroup[f];
                    for (var group in g) {
                        if (g.hasOwnProperty(group)) {
                            var value = g[group];
                            if (!(group in _SNFeatureOnGroupWContrast[wc])) {
                                _SNFeatureOnGroupWContrast[wc][group] = 0;
                            }
                            _SNFeatureOnGroupWContrast[wc][group] += value * _WContrast[wc][f];
                        }
                    }
                }
            }
        }
    };


    /***
     * weihts features of each data ponitns with contrast and sums them up
     * and also calculated sum of normalized data for each contrast in each group
     */
    var _calculateSNContrastData = function () {
        _SNConstratData = [];
        _SNContrastGroup = [];

        for (var c = 0; c < _WContrast.length; c++) {
            _SNConstratData.push(new Array(_data.group.length));
            _SNContrastGroup.push([]);
            for (var i = 0; i < _data.group.length; i++) {
                var sum = 0;
                var nwContrast = _calculateNWContrasts(_WContrast[c]);
                for (var f in nwContrast) {
                    if (nwContrast.hasOwnProperty(f)){
                        sum += _data[f][i] * nwContrast[f];
                    }
                }
                _SNConstratData[c][i] = sum;
                if (!(_data.group[i] in _SNContrastGroup[c])){
                    _SNContrastGroup[c][_data.group[i]] = 0;
                }
                _SNContrastGroup[c][_data.group[i]] += sum / _numDataGroup[_data.group[i]];
            }

        }
    };

    var _calculateSS = function () {
        _SS = new Array(_BContrast.length);
        for (var bc = 0; bc < _BContrast.length; bc++) {
            _SS[bc] = new Array(_WContrast.length);
            for (var wc = 0; wc < _WContrast.length; wc++) {
                var dnom = 0;
                for (var group in _BContrast[bc]) {
                    if (_BContrast[bc].hasOwnProperty(group)){ 
                    dnom += sqr(_BContrast[bc][group]) / _numDataGroup[group];
                    }
                }
                _SS[bc][wc] = sqr(_calculateSample(bc, wc)) / dnom;

            }
        }
    };

    var _calculateSample = function (bc, wc) {
        var r = 0;
        for (var group in _SNContrastGroup[wc]) {
            if (_SNContrastGroup[wc].hasOwnProperty(group)){
            r += _SNContrastGroup[wc][group] * _BContrast[bc][group];
            }
        }
        return r;
    };


    /***
     * calculates normalized within contrasts
     */
    var _calculateNWContrasts = function (contrast) {
        _NWContrast = [];
        var sum = 0;
        for (var f in contrast) {
            if (contrast.hasOwnProperty(f)){
            sum += sqr(contrast[f]);
            }
        }
        var nw = {};
        for (f in contrast) {
            if (contrast.hasOwnProperty(f)){
            nw[f] = contrast[f] / Math.sqrt(sum);
            }
        }
        return nw;

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

        for (var f in _data) {
            if (f !== 'group') {
                _SFeatureGroup[f] = {};
                _NFeatureGroup[f] = {};
                for (var i = 0; i < _data.group.length; i++) {
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
    };

    var value;
    var _calculateSSWithinGroups = function () {
        var deviationFeature = {};

        for (var f in _data) {
            if (f !== 'group') {
                value = _data[f];
                deviationFeature[f] = new Array(_data.group.length);
                for (var i = 0; i < _data.group.length; i++) {
                    deviationFeature[f][i] = value[i] - _MFeatureGroup[f][_data.group[i]];
                }
            }
        }

        var _SSFeatureGroup = {}; // feature and grouop

        for (f in deviationFeature) {
            if (deviationFeature.hasOwnProperty(f)){
            value = deviationFeature[f];
            if (f !== 'group') {
                _SSFeatureGroup[f] = {};
            }

            for (var j = 0; j < _data.group.length; j++) {
                if (!(_data.group[j] in _SSFeatureGroup[f])){_SSFeatureGroup[f][_data.group[j]] = 0;}
                _SSFeatureGroup[f][_data.group[j]] = _SSFeatureGroup[f][_data.group[j]] + sqr(_data[f][j] - _MFeatureGroup[f][_data.group[j]]);
            }
        }
        }

        _SSWithinGroups = {}; // feature and double

        for (f in _SSFeatureGroup) {
            if (_SSFeatureGroup.hasOwnProperty(f)){
            var gMap = _SSFeatureGroup[f];
            var temp = 0;
            for (var g in gMap) {
                if (gMap.hasOwnProperty(g)){
                temp += gMap[g];
                }
            }
            _SSWithinGroups[f] = Math.sqrt(temp / (_numData - _numGroup));
        }
        }
    };

    var _addFirstContrasts = function (wFactors, bFactors, wCon, bCon) {
        var cont = {};
        for (var f in wFactors) {
            if (wFactors.hasOwnProperty(f)){
            cont[wFactors[f]] = 1;
            }
        }

        _WContrast = [cont];
        _WContrast.push.apply(_WContrast, wCon);
        for (cont in _WContrast) {
            if (_WContrast.hasOwnProperty(cont)){
            delete _WContrast[cont].$$hashKey;// this is added by angular
            }
        }


        cont = {};
        for (f  in bFactors) {
            if (bFactors.hasOwnProperty(f)){
            cont[bFactors[f]] = 1;
            }
        }
        _BContrast = [cont];
        _BContrast.push.apply(_BContrast, bCon);
        for (cont in _BContrast){
            if (_BContrast.hasOwnProperty(cont)){
            delete _BContrast[cont].$$hashKey;// this is added by angular
            }
        }
    };


    var anovaInterface = {};


// interface methods

    /***
     * sets the data for anova analysis, and extracts variables from that.
     */
    anovaInterface.setData = function (data, wFactors, bFactors, wContrasts, bContrasts) {
        this.hasData = true;
        _data = data;
        _numData = _data.group.length;
        _WContrast = angular.copy(wContrasts);
        _BContrast = angular.copy(bContrasts);
        _InputBContrasts = angular.copy(bContrasts);
        _InputWContrasts = angular.copy(wContrasts);
        _addFirstContrasts(wFactors, bFactors, wContrasts, bContrasts);


        _calculateGroupData();
        _calculateSNContrastData();
        _calculateSS(); // this.SS can be accesses here
        _calculateSSEWContrast(); // this.getF can be accessed here

        _calculateMeanOfFeatureGroup();
        _calculateSSWithinGroups();
        _calculateSNFeatureOnGroupContrast();
        _calculateFCriticalValue();
        _calculateSE();
        _calculateMeanSD();

    };

    anovaInterface.getDF = function () {
        return 1;
    };

    anovaInterface.getErrorDF = function () {
        return _numData - _numGroup;
    };


    anovaInterface.getMeanOfFeatureGroup = function (f, g) {
        return _MFeatureGroup[f][g];
    };

    anovaInterface.getSDOfFeatureGroup = function (f, g) {
        return Math.sqrt(_SSFeatureGroup[f][g] / (_numDataGroup[g] - 1));
    };


    anovaInterface.getSS = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return _SS[bc][wc];
    };

    anovaInterface.getMS = function (bc, wc) {
        return this.getSS(bc, wc) / this.getDF();
    };

    anovaInterface.getWContrasts = function () {
        return _InputWContrasts;
    };

    anovaInterface.getBContrasts = function () {
        return _InputBContrasts;
    };

    anovaInterface.getF = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return _SS[bc][wc] / _calculateMSError(wc);
    };

    anovaInterface.getWithinSSError = function (wc) {
        wc = wc === null ? 0 : wc + 1;
        return _SSEWContrast[wc];
    };

    anovaInterface.getWithinMSError = function (wc) {
        return this.getWithinSSError(wc) / this.getErrorDF();
    };


    anovaInterface.getBetweenSSError = function () {
        return _SSEWContrast[0];
    };

    anovaInterface.getBetweenMSError = function () {
        return _SSEWContrast[0] / this.getErrorDF();
    };


    anovaInterface.getConfidenceIntervals = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return [(_sampleValue[bc][wc] - (_SE[bc][wc] * Math.sqrt(_F_critic))),
            (_sampleValue[bc][wc] + (_SE[bc][wc] * Math.sqrt(_F_critic)))
        ];
    };

    anovaInterface.getStandardConfidenceIntervals = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return [(_sampleValue[bc][wc] - (_SE[bc][wc] * Math.sqrt(_F_critic))) / _meanSD,
            (_sampleValue[bc][wc] + (_SE[bc][wc] * Math.sqrt(_F_critic))) / _meanSD
        ];
    };

    anovaInterface.getStandardSE = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return _SE[bc][wc] / _meanSD;
    };

    anovaInterface.getSE = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return _SE[bc][wc];
    };

    anovaInterface.getStandardValue = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return _sampleValue[bc][wc] / _meanSD;
    };

    anovaInterface.getValue = function (bc, wc) {
        wc = wc === null ? 0 : wc + 1;
        bc = bc === null ? 0 : bc + 1;
        return _sampleValue[bc][wc];
    };

    anovaInterface.test = function (bc, wc) {
//        console.log('_SE');
//        console.log(_SE);
//        console.log('_MFeatureGroup');
//        console.log(_MFeatureGroup);
    };

    anovaInterface.hadData = false;


//    anovaInterface.loadTestData = function () {
//        var test_data = [
//            ['1', 22, 37, 34, 31],
//            ['1', 18, 31, 28, 31],
//            ['1', 21, 29, 28, 26],
//            ['1', 9, 32, 31, 28],
//            ['1', 13, 28, 28, 27],
//            ['1', 15, 36, 20, 25],
//            ['1', 13, 22, 34, 27],
//            ['1', 14, 25, 23, 26],
//            ['1', 10, 27, 25, 22],
//            ['1', 5, 23, 19, 17],
//            ['2', 25, 41, 29, 25],
//            ['2', 20, 28, 26, 22],
//            ['2', 17, 29, 21, 25],
//            ['2', 17, 27, 18, 22],
//            ['2', 22, 25, 19, 15],
//            ['2', 11, 33, 23, 19],
//            ['2', 13, 25, 19, 23],
//            ['2', 16, 24, 15, 21],
//            ['2', 11, 27, 20, 14],
//            ['2', 8, 21, 10, 14],
//            ['3', 25, 23, 25, 23],
//            ['3', 19, 19, 18, 16],
//            ['3', 16, 16, 18, 18],
//            ['3', 18, 18, 16, 12],
//            ['3', 12, 14, 20, 14],
//            ['3', 16, 14, 12, 18],
//            ['3', 15, 19, 13, 9],
//            ['3', 12, 8, 16, 16],
//            ['3', 9, 11, 13, 7],
//            ['3', 8, 8, 9, 7]
//        ];
//        var wcont = [
//            {
//                'f1': 1, 'f2': 1, 'f3': 1, 'f4': 1
//            },
//            {
//                'f1': 3, 'f2': -1, 'f3': -1, 'f4': -1
//            },
//            {
//                'f1': 0, 'f2': 2, 'f3': -1, 'f4': -1
//            },
//            {
//                'f1': 0, 'f2': 0, 'f3': 1, 'f4': -1
//            }
//        ];
//
//        var bcont = [
//            {
//                '1': 1, '2': 1, '3': 1
//            },
//            {
//                '1': 1, '2': 1, '3': -2
//            },
//            {
//                '1': 1, '2': -1, '3': 0
//            }
//        ];
//
//
//        var data = {};
//        data['group'] = [];
//        data['f1'] = [];
//        data['f2'] = [];
//        data['f3'] = [];
//        data['f4'] = [];
//
//        for (var i = 0; i < test_data.length; i++) {
//            data['group'].push(test_data[i][0]);
//            data['f1'].push(test_data[i][1]);
//            data['f2'].push(test_data[i][2]);
//            data['f3'].push(test_data[i][3]);
//            data['f4'].push(test_data[i][4]);
//        }
//
//        this.setData(data, wcont, bcont);
//
//    };

    return anovaInterface;
}]);