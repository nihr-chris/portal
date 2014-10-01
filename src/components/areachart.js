/**
 * Defines an area chart component, created using the <areachart> element.
 * 
 * Chart content is supplied via the 'model' attribute.
 * See areachart.model.timeseries.js for a documented example.
 */
 
var Ractive = require("ractive");
var template = require("template");

Ractive.components.areachart = Ractive.extend({
    template: template('areachart.html'),
    init: function () {
      
    },
    data: {
        axisMin:function(axis){ return axis.ticks[0]; },
        axisMax:function(axis){ return axis.ticks[axis.ticks.length - 1]; },
        chart: require('paths-js/smooth-line')
    },
    isolated: true
});
