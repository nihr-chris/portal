var Ractive = require("ractive");
var template = require("template");
var log = require('loglevel');

log.setLevel("trace");

require('./components/widgets.js');
require('./components/filter.js');
require('./components/master-detail.js');
require('./components/barchart.js');
require('./components/recruitmentPerformance-yy.js');

new Ractive.components.recruitmentPerformanceYY({
    el: "#main"
});
