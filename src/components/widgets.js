var Ractive = require("ractive");
var template = require('template');
var _ = require("underscore");

Ractive.components.dropdown = Ractive.extend({
    isolated: true,
    template: template('widgets.dropdown.html'),
    
    init: function() {
        var component = this;
        
        component.on('select', function(event) {
            component.set("selected", event.context);
        });
        
        var ensureOneItemIsSelected = function(items) {
            if (!items) return;
            
            var selectedItem = component.get("selected");
            
            if (!selectedItem || !_.contains(items, selectedItem)) {
                component.set("selectedItem", items[0]);
            }
        };
        
        component.observe("items", ensureOneItemIsSelected);
        ensureOneItemIsSelected(component.get("items"));
    },
    
    data: {
        format: function(x){ return x; }
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
