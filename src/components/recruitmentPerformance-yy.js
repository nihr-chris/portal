var Ractive     = require("ractive");
var template    = require("template");
var _           = require("underscore");

var Recruitment = require("../modules/recruitment.js");

var recruitment = new Recruitment({
    outputColumns: [],
    promise: Promise.resolve()
});

Ractive.components.recruitmentPerformanceYY = Ractive.extend({
    template: template("recruitmentPerformance-yy.html"),
    
    init: function() {
        var component = this;
        component.observe("filterMode commercial weighted", function(newval) {
            var modeMap = {
                "By Trust":     "trust",
                "By Division":  "division",
                "By Specialty": "specialty"
            };
            
            var commercialMap = {
                "Commercial Only": true,
                "Noncommercial Only": false
            };
            
            component.annualRecruitmentData = Recruitment.operation()
            .fetchBandedRecruitment({
                by: modeMap[component.get("filterMode")],
                commercialStudies: commercialMap[component.get("commercial")]
            })
            .performanceBarGraph({
                colors: [],
                weighted: component.get("weighted")
            });
        });
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
