var _ = require("underscore");

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
    return {
        x: x,
        y: y,
        
        data: _.map(rawData, 'points'),
          
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
