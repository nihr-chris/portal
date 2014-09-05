var Ractive = window.Ractive;
var template = require('template');

module.exports = Ractive.extend({
    template: template('dropdown'),
    
    init: function() {
        this.on('select', function(event) {
            this.current = event.context;
        });
    },
    
    data: {
        title: null,
        current: null,
        options: []
    }
});
