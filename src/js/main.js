var Ractive = window.Ractive;

var util = require('./util.js');
var template = require('template');

var reports = [
    {id: 'overview', title: "Overview"},
    require('./recruitment.js'),
    {id: 'timeTarget', title: "Time & Target"}
];

var reportLookup = util.hashArray('id', reports);

var r = new Ractive({
    el: 'sidebar',
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
});

r.on({
    navbarSelect: function(event) {
        this.set('activeReport', event.context);
    }
});
