var Ractive = require("ractive");
var template = require("template");
var _ = require("underscore");
var timeseries = require("../modules/timeseries.js");

Ractive.components.recruitmentPerformanceYY = Ractive.extend({
    template: template("recruitmentPerformance-yy.html"),
    
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
