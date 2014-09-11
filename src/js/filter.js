var Ractive = window.Ractive;
var template = require("template");

module.exports = Ractive.extend({
    template: template('filter'),
    init: function () {
        var component = this;
        
        component.on('delete', function(event) {
            component.data.removeRow(event.context);
        });
        
        component.on('insert', function(event) {
            component.data.addRow();
        });
        
        component.rows = [];
    },
    isolated: true
});
