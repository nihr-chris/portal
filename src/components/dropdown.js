var Ractive = require("ractive");
var template = require('template');
var log = require('loglevel');

Ractive.components.dropdown = Ractive.extend({
    template: template('dropdown.html'),
    
    init: function() {
        var component = this;
        
        component.on('select', function(event) {
            log.info("selected: " + JSON.stringify(event.context));
            
            if (event.context.select) {
                component.select(event.context);
                
            } else {
                log.warn("No select function defined for dropdown");
            }
        });
    },
    isolated: true
});
