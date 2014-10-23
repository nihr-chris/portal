var _           = require("underscore");

var Operation   = require("./operation.js");
var util        = require("./util.js");

module.exports = Operation.module({
    operations: {
        
        /**
         * Transforms a series of rows into a series of of objects describing
         * stacked bar chart groups.
         */
        barChart: function(params) {
            util.checkArgs(arguments, {
                valueFrom: String,
                stackBy: [String, null],
                seriesBy: [String, null],
                groupBy: [String, null]
            });
            
            function group(rows, column, transform) {
                if (column) {
                    var grouped = _.groupBy(rows, column);
                    return _.map(grouped, transform);
                } else {
                    return[transform(rows, "")];
                }
            }
            
            function sumRowValues(memo, row) {
                return memo + row[params.valueFrom];
            }
            
            return this.childOperation({
                inputColumns: _.compact([params.valueFrom, params.stackBy, params.seriesBy, params.groupBy]),
                outputColumns: [],
                
                transform: function(rows) {
                    return group(rows, params.groupBy, function(rows, key) {
                        var groupValues = group(rows, params.seriesBy, function(rows, key) {
                            var barValues = group(rows, params.stackBy, function(rows, key) {
                                
                                return {
                                    key: key,
                                    value: _.reduce(rows, sumRowValues, 0)
                                };
                            });
                            
                            return {key: key, values: barValues};
                        });
                        
                        return {key: key, values: groupValues};
                    });
                }
            });
        }
    }
});
