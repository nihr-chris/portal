var Ractive = require("ractive");

require('./components/areachart.js');
require('./components/dropdown.js');
require('./components/filter.js');
require('./components/recruitment.js');

var util = require('./modules/util.js');
var template = require('template');
var log = require('loglevel');

log.setLevel("trace");

var reports = [
    {id: 'overview', title: "Overview"},
    {id: 'recruitment', title: "Recruitment"},
    {id: 'timeTarget', title: "Time & Target"}
];

var reportLookup = util.hashArray('id', reports);

var r = new Ractive({
    el: 'main',
    template: template("masterDetail"),
    data: {
        reports: reports,
        activeReport: reportLookup['recruitment']
    },
    partials: {
        "timeTarget": template("timeTarget"),
        "overview": template("overview"),
        "recruitment": template("recruitment")
    }
});

r.on({
    navbarSelect: function(event) {
        log.info("selected: " + event.context);
        this.set('activeReport', event.context);
    }
});
