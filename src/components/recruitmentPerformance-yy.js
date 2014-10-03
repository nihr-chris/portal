var Ractive = require("ractive");
var template = require("template");

Ractive.components.recruitmentPerformanceYY = Ractive.extend({
    template: template("recruitmentPerformance-yy.html"),
    
    init: function() {
        this.on("dropdown.select", function() {
             
        });
    },
    
    data: {
        filterTypes: [
            {label: "By Trust"}, 
            {label: "By Specialty"}, 
            {label: "By Division"}
        ],
        filterTypeIdx: 0,
        
        commercialOptions: [
            {label: "Commercial"}, 
            {label: "Noncommercial"}, 
            {label: "Both"}
        ],
        commercialOptionIdx: 0,
        
        weightingOptions: [
            {label: "Unweighted"}, 
            {label: "Weighted"}
        ],
        weightingOptionIdx: 0
    }
});
