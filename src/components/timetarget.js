var Ractive     = require("ractive");
var template    = require("template");
var _           = require("underscore");

var Recruitment = require("../modules/recruitment.js");
var palette     = require("../modules/palette.js");

Ractive.components.timetarget = Ractive.extend({
    template: template("timetarget.html"),
    
    init: function() {
        var component = this;
        component.observe("selectedOrgs", function(newval, oldval) {
            if (oldval) component.load();
        });
        
        this.set("memberOrgs", [
            "Croydon Health Services NHS Trust",
            "Epsom and St Helier University Hospitals NHS Trust",
            "Guy's and St Thomas' NHS Foundation Trust",
            "King's College Hospital NHS Foundation Trust",
            "Kingston Hospital NHS Foundation Trust",
            "Oxleas NHS Foundation Trust",
            "South London and Maudsley NHS Foundation Trust",
            "South London Healthcare NHS Trust",
            "South London Primary Care",
            "South West London and St George's Mental Health NHS Trust",
            "St George's Healthcare NHS Trust",
            "The Royal Hospital For Neuro-Disability",
            "The Royal Marsden NHS Foundation Trust"
        ]);
        
        this.set("selectedOrgs", [
            "Croydon Health Services NHS Trust",
            "Guy's and St Thomas' NHS Foundation Trust",
            "King's College Hospital NHS Foundation Trust",
            "South London and Maudsley NHS Foundation Trust",
            "South London Primary Care",
        ]);
        
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
            .filterValues({
                column: "MemberOrg",
                values: this.get("selectedOrgs")
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
