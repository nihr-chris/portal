var Ractive = require("ractive");
var template = require("../templates.js");
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

Ractive.components.multidropdown = Ractive.extend({
    isolated: true,
    template: template('widgets.multidropdown.html'),
    
    init: function() {
        var component = this;
        
        if (!component.get("items")) component.set("items", []);
        if (!component.get("items")) component.set("selected", []);
        
        component.on('select', function(event) {
            var oldSelection = component.get("selected");
            var item = event.context;
            
            if (_.contains(oldSelection, item)) {
                component.set("selected", _.without(oldSelection, item));
            } else {
                component.push("selected", item);
            }
        });
    },
    
    data: {
        format: _.identity,
        contains: _.contains
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

Ractive.components.panel = Ractive.extend({
    template: template("widgets.panel.html")
});

Ractive.components.controlbar = Ractive.extend({
    template: "<ul class='nav nav-pills'> {{yield}} </ul>"
});

Ractive.components.row = Ractive.extend({
    template: "<div class='row'> {{yield}} </div>"
});

Ractive.components.column = Ractive.extend({
    template: "<div class='column-xs-{{size ? size : 12}}'> {{yield}} </div>"
});
