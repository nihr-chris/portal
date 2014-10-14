var Ractive     = require("ractive");
var template    = require("template");
var _           = require("underscore");

var Recruitment = require("../modules/recruitment.js");
var palette     = require("../modules/palette.js");

var modeMap = {
    "By Trust":     "trust",
    "By Division":  "division",
    "By Specialty": "specialty"
};

var commercialMap = {
    "Commercial Only": true,
    "Noncommercial Only": false
};

Ractive.components.recruitmentPerformanceYY = Ractive.extend({
    template: template("recruitmentPerformance-yy.html"),
    
    init: function() {
        var component = this;
        
        component.observe("filterMode", function(newval, oldval) {
            if (newval && oldval) component.loadAll();
        });
        
        component.observe("commercial weighted selectedFilterItems", function(newval, oldval) {
            if (newval && oldval) component.load();
        });
        
        component.loadAll();
    },
    
    loadAll: function() {
        var component = this;
        
        Recruitment.operation()
        .fetchBandedRecruitment({
            by: modeMap[this.get("filterMode")]
        })
        .justFields(["Grouping"])
        .format(function(rows) {
            return _.uniq(_.map(rows, "Grouping")).sort();
        })
        .then(function(value) {
            value = _.without(value, 0);
            
            component.set("filterItems", value);
            component.set("selectedFilterItems", []);
        })
        .then(function() {
            component.load();
        });
    },
    
    load: function() {
        this.set("annualRecruitmentData", 
            Recruitment.operation()
            .fetchBandedRecruitment({
                by: modeMap[this.get("filterMode")],
                commercialStudies: commercialMap[this.get("commercial")]
            })
            .filterValues({
                column: "Grouping",
                values: this.get("selectedFilterItems")
            })
            .performanceBarGraph({
                colors: palette.generate(["Interventional/Both", "Observational", "Large", "Merged"]),
                weighted: this.get("weighted")
            })
            .then(function(x) {
                // Break here to catch chart data
                return x;
            })
        );
    },
    
    data: {
        filterModeOptions:  [
            "By Trust",
            "By Division",
            "By Specialty"
        ],
        filterMode: "By Trust",
        
        commercialOptions:  [
            "Commercial & Noncommercial",
            "Commercial Only",
            "Noncommercial Only"
        ],
        commercial: "Commercial & Noncommercial",
        
        weighted: true,
        
        examplelegend: [
            {key: 2001, color: "#98abc5"},
            {key: 2002, color: "#8a89a6"}
        ],
        exampledata: [
            {
                key: "Guy's", 
                values: [
                    {
                        key: 2001,
                        values: [
                            {color: "#98abc5", value: 5},
                        ]
                    },
                    {
                        key: 2002,
                        values: [
                            {color: "#8a89a6", value: 8},
                        ]
                    },
                ]
            }, {
                key: "King's", 
                values: [
                    {
                        key: 2001,
                        values: [
                            {color: "#98abc5", value: 2},
                        ]
                    },
                    {
                        key: 2002,
                        values: [
                            {color: "#8a89a6", value: 1},
                        ]
                    },
                ]
            }
        ]
    }
});
