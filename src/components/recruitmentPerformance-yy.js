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
        
        exampledata: [
            {key: "Guy's", values: [[2001, 1], [2002, 2], [2003, 3]]},
            {key: "Kings", values: [[2001, 5], [2002, 4], [2003, 3]]},
            {key: "Croydon", values: [[2001, 2], [2002, 2], [2003, 3]]}
        ]
    }
});
