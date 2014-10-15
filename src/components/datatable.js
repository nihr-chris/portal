var Ractive = require("ractive");
var template = require("template");
var _ = require("underscore");

Ractive.components.datatable = Ractive.extend({
    template: template("datatable.html"),
    init: function() {
        var component = this;
        
        component.observe("data keys", function(newval) {
            component.set("rows", _.map(component.get("data"), function(r) {
                return _.map(component.get("keys"), function(k) {
                    return r[k];
                });
            }));
        });
    }
});
