var Ractive = window.Ractive;
var util = require("./util.js");
var template = require("template");
var timeseries = require("./chartmodel.timeseries.js");

var filterCategories = [
    {
        id: 'trust', 
        label: "By Trust",
        options: [
        ]
    },
    {id: 'division', label: "By Division"},
    {id: 'site', label: "By Site"},
    {id: 'study', label: "By Study"}
];

var trusts = [
    {name: 'Trust1'}
];

var filterCategoryLookup = util.hashArray('id', filterCategories);

module.exports = Ractive.extend({
    template: template('recruitment'),
    init: function () {
        
    },
    data: {
        categories: filterCategories,
        chartModel: timeseries([
            {
                color: "#FF2200",
                points: [
                    [new Date(1, 2, 2014), 20],
                    [new Date(1, 3, 2014), 30],
                    [new Date(1, 4, 2014), 60],
                    [new Date(1, 5, 2014), 70],
                ]
            },
            {
                color: "#2200FF",
                points: [
                    [new Date(1, 2, 2014), 100],
                    [new Date(1, 3, 2014), 30],
                    [new Date(1, 4, 2014), 30],
                    [new Date(1, 5, 2014), 10],
                ]
            }
            
        ])
    }
});
