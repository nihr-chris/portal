var Ractive = require("ractive");
var template = require("../templates.js");
var log = require("loglevel");

Ractive.components.filter = Ractive.extend({
    template: template('filter.html'),
    init: function () {
        var component = this;
        
        if (!component.get("newitem")) {
            throw new Error("Filter must always have a newitem attribute set");
        }
        
        component.on('delete', function(event) {
            component.data.removeRow(event.context);
        });
        
        component.on('add', function(event) {
            var newitem = component.get("newitem");
            component.push("items", newitem());
        });
        
        component.rows = [];
    },
    isolated: false
});

if (window.developmentMode) {
    Ractive.components.testFilter = Ractive.extend({
        template:   "<filter items='{{filteritems}}' newitem='{{newitem}}'>" 
                    + "<dropdown items={{menuitems}} selected='{{menuselected}}'></dropdown>"
                    + "</filter>",
        data: {
            filteritems: [
                {menuitems: ["a", "b", "c"], menuselected: "a"}
            ],
            
            newitem: function() {
                return {menuitems: ["a", "b", "c"], menuselected: "a"};
            }
        },
    });
}