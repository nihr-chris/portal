var Ractive = window.Ractive;
var util = require("./util.js");
var template = require("template");

var filterCategories = [
    {id: 'trust', label: "By Trust"},
    {id: 'division', label: "By Division"},
    {id: 'site', label: "By Site"},
    {id: 'study', label: "By Study"}
];

var filterCategoryLookup = util.hashArray('id', filterCategories);

module.exports = Ractive.extend({
    template: template('recruitment'),
    init: function () {
        
    }
});
