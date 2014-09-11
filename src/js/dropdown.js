var Ractive = window.Ractive;
var template = require('template');
var log = require('loglevel');

module.exports = Ractive.extend({
    template: template('dropdown'),
    
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
