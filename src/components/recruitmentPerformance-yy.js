var Ractive     = require("ractive");
var template    = require("../templates.js");
var _           = require("underscore");

var Recruitment = require("../modules/recruitment.js");

Ractive.components.recruitmentPerformanceYY = Ractive.extend({
    template: template("recruitmentPerformance-yy.html"),
    
    init: function() {
        this.set("filters", []);
    },
    
    data: {
        getGraphData: function(filters) {
            return Recruitment.operation().weightedGraph(filters);
        },
        
        getFilterOptions: function(column) {
            return Recruitment.operation().filterOptions(column);
        },
        
        commercialOptions: [
            "Commercial",
            "Non-Commercial",
        ],
        
        formatSelectedCommercial: function(selected) {
            if (selected.length === 1) return selected[0];
            else return "Commercial & Non-Commercial";
        },
        
        formatSelected: function(array) {
            switch(array.length) {
                case 0: return "All";
                case 1: return array[0];
                default: return "Multiple";
            }
        },
        
        newfilter: function() {
            return {
                MemberOrg: [], MainReportingDivision: [], MainSpecialty: [], CommercialStudy: []
            };
        }
    }
});
