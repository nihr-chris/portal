var Ractive = window.Ractive;
Ractive.components.dropdown = require('./dropdown.js');
Ractive.components.datafilter = require('./filter.js')
Ractive.components.areachart = require('./areachart.js')

var util = require('./util.js');
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
    },
    components: {
        recruitment: require('./recruitment.js')
    }
});

r.on({
    navbarSelect: function(event) {
        log.info("selected: " + event.context);
        this.set('activeReport', event.context);
    }
});
