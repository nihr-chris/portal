var Color   = require("color");
var _       = require("underscore");

var util    = require("./util.js")

var palette = {};
var baseColors = [
    "#bd0026",
    "#f03b20",
    "#fd8d3c",
    "#feb24c",
    "#fed976",
    "#ffffb2",
];

palette.generate = function(keys) {
    util.checkArgs(arguments, Array.of(String));
    
    var colors = {};
    _.each(keys, function(key, i) {
        colors[key] = baseColors[i];
        return colors;
    });
    
    return colors;
};

module.exports = palette;