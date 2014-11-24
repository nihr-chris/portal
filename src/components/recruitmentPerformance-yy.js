var Ractive     = require("ractive");
var template    = require("../templates.js");
var _           = require("underscore");

var Recruitment = require("../modules/recruitment.js");

Ractive.components.recruitmentPerformanceYY = Ractive.extend({
    template: template("recruitmentPerformance-yy.html"),
    
    init: function() {
        this.set("filters", []);
        this.set("weighted", true);
        this.set("graphType", "byRY");
    },
    
    data: {
        getGraphData: function(params) {
            switch(params.graphType) {
                case "byFY", "byRY": {
                    return Recruitment.operation().yearRecruitmentGraph({
                        filters: params.filters,
                        mode: "byFY",
                        years: ["2012-13", "2013-14", "2014-15"],
                        weighted: params.weighted
                    });
                }
                case "byMonth": {
                    return Recruitment.operation().monthRecruitmentGraph({
                        filters: params.filters,
                        year: "2014-15",
                        weighted: params.weighted
                    });
                }
            }
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
        
        formatGraphType: function(type) {
            switch(type) {
                case "byFY": return "Annual (by Financial Year)";
                case "byRY": return "Annual (by Recruitment Year)";
                case "byMonth": return "Monthly";
            }
        },
        
        newfilter: function() {
            return {
                MemberOrg: [], MainReportingDivision: [], MainSpecialty: [], CommercialStudy: []
            };
        }
    }
});
