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

palette.generate = function(count, keys) {
    util.checkArgs(arguments, Number, Array.of(String));
    
    var minSat = 0.5, maxSat = 0.9;
    var range = maxSat - minSat;
    
    return _.map(baseColors, function(c) {
        var colors = {};
        
        _.each(keys, function(key, i) {
            var normalizedSaturation = (i + 1) / keys.length;
            var sat = normalizedSaturation * range + minSat;
            
            colors[key] = Color(c)
                .desaturate(sat)
                .hexString()
                ;
        });
        
        return colors;
    });
}

module.exports = palette;