var Ractive = window.Ractive;
var template = require('template');

module.exports = Ractive.extend({
    template: template('dropdown'),
    
    init: function() {
        var component = this;
        
        component.on('select', function(event) {
            console.log(JSON.stringify(event.context));
            component.current = event.context;
        });
    },
    isolated: true
});
