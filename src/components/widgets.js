var Ractive = require("ractive");
var template = require('template');

Ractive.components.dropdown = Ractive.extend({
    isolated: true,
    template: template('widgets.dropdown.html'),
    
    init: function() {
        var component = this;
        
        component.on('select', function(event) {
            component.set("selected", event.context);
        });
        
        component.set("selected", component.get("items")[0]);
    }
});

Ractive.components.toggle = Ractive.extend({
    isolated: true,
    template: template('widgets.toggle.html'),
    
    init: function() {
        var component = this;
        
        component.on('toggle', function(event) {
            component.toggle("value");
        });
    },
    
    data: {
        enabled: true,
        value: false,
        label: ""
    }
});
