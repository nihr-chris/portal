var Ractive = window.Ractive;
var util = require("./util.js");
var template = require("template");
var stock = require('paths-js/stock');

function mkdate(y, m) {
  var d = new Date();
  d.setYear(y);
  d.setMonth(m - 1);
  return d.getTime();
}

var x = {
  ticks: [
    mkdate(2012, 1),
    mkdate(2012, 2),
    mkdate(2012, 3)
  ],
  format: function(time) {
    console.log("t " + time);
    var date = new Date();
    date.setTime(time);
    console.log("d " + date);
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

module.exports = Ractive.extend({
    template: template('areachart'),
    init: function () {
        
    },
    data: {
        axisMin:function(axis){ return axis.ticks[0]; },
        axisMax:function(axis){ return axis.ticks[axis.ticks.length - 1]; },
        x: x,
        y: y,
        height: 200,
        chart: function() {
            return stock({
                data: [
                  [
                    { year: 2012, month: 1, value: 13 },
                    { year: 2012, month: 2, value: 12 },
                    { year: 2012, month: 3, value: 15 }
                  ],
                  [
                    { year: 2012, month: 1, value: 21 },
                    { year: 2012, month: 2, value: 22 },
                    { year: 2012, month: 3, value: 22 }
                  ]
                ],
                xaccessor: function(data){
                  var d = new Date();
                  d.setYear(data.year);
                  d.setMonth(data.month - 1);
                  return d.getTime();
                },
                yaccessor: function(d) { return d.value; },
                width: 300,
                height: 200,
                closed: true
            });
        }
    }
});
