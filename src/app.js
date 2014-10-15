var Ractive = require("ractive");
var template = require("./templates.js");

var log = require('loglevel');
log.setLevel("trace");

var Fusion = require("./modules/fusion.js");
Fusion.APIKey = "AIzaSyApVcaHU-Drez2RpLdOu5AUOZeL6tOq6Lk";
Fusion.HTTPClient = require("browser-request");

require('./components/widgets.js');
require('./components/filter.js');
require('./components/master-detail.js');
require('./components/barchart.js');
require('./components/recruitmentPerformance-yy.js');
require('./components/timetarget.js');
require('./components/datatable.js');

window.runApp = function(mainComponent) {
    new Ractive({
        el: "#main",
        template: "<" + mainComponent + "></" + mainComponent + ">"
    });
};
