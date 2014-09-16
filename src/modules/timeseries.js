var _ = require("underscore");
var moment = require("moment");
var numeral = require("numeral");

/**
 * Given a maximum value and a preferred number of steps,
 * return a factor that will produce a nicely incremented y axis,
 * while covering all values.
 */
function findStepFactor(maxVal, preferredStepCount) {
  var stepMajor = 1;
  
  while (true) {
    var stepMinor = _.find([1, 2, 5], function(x){ 
      return (x * stepMajor * preferredStepCount) >= maxVal;
    });
    
    if (stepMinor) return stepMinor * stepMajor;
    else stepMajor *= 10;
  }
}

/**
 * Convert rawData into a timeseries chart model.
 * 
 * See timeseries.spec.js for an example of the rawData argument.
 */
module.exports = function(rawData) {
    var dataPointsBySeries = _.map(rawData, 'points');
    var mergedDataPoints = _.flatten(dataPointsBySeries, true);
    
    function tickValues(index) {
      var values = _.map(mergedDataPoints, function(e){ 
        return e[index]; 
      });
      
      return _.sortBy(values, _.identity);
    }
    
    var xTicks = _.map(tickValues(0), function(d){ return d.getTime(); });
    
    var maxY = _.max(tickValues(1));
    var yFactor = findStepFactor(maxY, 5);
    var yTicks = _.range(0, maxY + yFactor, yFactor);
    
    return {
        x: {
          ticks: _.uniq(xTicks, true),
          format: function(time) {
            return moment(time).format("MMM-YY");
          }
        },
        y: {
          ticks: yTicks,
          format: function(value) {
            return numeral(value).format("0,0");
          }
        },
        
        data: dataPointsBySeries,
          
        xaccessor: function(point){
          return point[0].getTime();
        },
        yaccessor: function(point) { 
          return point[1]; 
        },
        
        width: rawData.width ? rawData.width : 600,
        height: rawData.height ? rawData.height : 200,
        
        closed: true,
        color: function(index) {
          return rawData[index].color;
        }
    };
};
