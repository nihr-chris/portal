var Color   = require("color");
var _       = require("underscore");

var util    = require("./util.js")

var palette = {};
var baseColors = [
    "#5DA5DA",
    "#FAA43A",
    "#60BD68",
    "#F17CB0",
    "#B2912F",
    "#B276B2",
    "#DECF3F",
    "#F15854"
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