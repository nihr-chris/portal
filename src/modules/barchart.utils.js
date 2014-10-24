var _ = require('underscore');
var palette = require('./palette.js');

var barchart = {};

barchart.legend = function(data) {
    
};

barchart.eachStack = function(chartData, fn) {
    _.each(chartData, function(group){
        _.each(group.values, function(bar){
            _.each(bar.values, fn);
        });
    });
};

barchart.colorise = function(data) {
    var options = [];
    
    barchart.eachStack(data, function(stack) {
        if (!_.contains(options, stack.key)) options.push(stack.key);
    });
    
    var colors = palette.generate(options);
    
    barchart.eachStack(data, function(stack) {
        if (!stack.color) {
            stack.color = colors[stack.key];
        }
    });
};

module.exports = barchart;
