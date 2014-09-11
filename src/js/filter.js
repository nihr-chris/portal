var Ractive = window.Ractive;
var template = require("template");
var log = require("loglevel");

module.exports = Ractive.extend({
    template: template('filter'),
    init: function () {
        var component = this;
        
        component.on('delete', function(event) {
            log.info("remove filter");
            component.data.removeRow(event.context);
        });
        
        component.on('insert', function(event) {
            log.info("add filter");
            component.data.addRow();
        });
        
        component.rows = [];
    },
    isolated: true
});
