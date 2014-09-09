var _ = require("underscore");
var moment = require("moment");
var numeral = require("numeral");

function mktime(y, m) {
  var d = new Date();
  d.setYear(y);
  d.setMonth(m - 1);
  return d.getTime();
}

var x = {
  ticks: [
    mktime(2012, 1),
    mktime(2012, 2),
    mktime(2012, 3)
  ],
  format: function(time) {
    var date = new Date();
    date.setTime(time);
    return date.getMonth(date) + 1;
  }
}

var y = {
  ticks: [
    0,
    10,
    20,
    25
  ],
  format: function(y) {
    return y;
  }
}

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
    var yTicks = tickValues(1);
  
    return {
        x: {
          ticks: _.uniq(xTicks, true),
          format: function(time) {
            return moment(time).format("MMM-YY");
          }
        },
        y: {
          ticks: _.uniq(yTicks, true),
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
