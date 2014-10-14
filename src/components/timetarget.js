var Ractive     = require("ractive");
var template    = require("template");
var _           = require("underscore");

var Recruitment = require("../modules/recruitment.js");
var palette     = require("../modules/palette.js");

Ractive.components.timetarget = Ractive.extend({
    template: template("timetarget.html"),
    
    init: function() {
        var component = this;
        component.observe("commercial open", function(newval, oldval) {
            if (oldval) component.load();
        });
        component.load();
    },
    
    load: function() {
        this.set("timeTargetGraphData",
            Recruitment.operation()
            .timeTargetStudyInfo({
                open: this.get("open"),
                commercial: this.get("commercial"),
                financialYear: 2014
            })
            .withTimeTargetInfo()
            .withTimeTargetRAG()
            .timeTargetGraph({
                colors: {Red: "darkred", Amber: "darkorange", Green: "green", IncompleteInformation: "lightstategray"}
            })
        );
    },
    
    data: {
        commercial: false,
        open: false
    }   
});
