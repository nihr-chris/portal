/**
 * Component for presenting a list of options, along with a different 'detail'
 * component depending on which of the options is currently active.
 * 
 * Eg: We use this for showing a sidebar list of possible reports on the left, 
 * along with a component that actually displays the report on the right.
 */

var Ractive = require("ractive");
var util = require("../modules/util.js");

Ractive.components.masterdetail = Ractive.extend({
    isolated: true,
    
    init: function() {
        var component = this;
        var options = util.hashArray("id", component.data.options);
        
        component.on('optionSelected', function(evt) {
            component.set('current', evt.context.id);
        });
        
        component.observe('current', function(newVal) {
            var option = options[newVal];
            if (option) {
                component.setDetailComponent(option.component);
            }
        });
        
        if (component.data.options.length > 0) {
            var defaultOption = component.data.options[0];
            component.set("current", defaultOption.id);
        }
    },
    
    setDetailComponent: function(newComponent) {
        var oldComponent = this.detailComponent;
        var elem = this.data.detailElement;
        
        if (oldComponent) {
            oldComponent.unrender(elem);
            oldComponent.detach();
        }
        
        if (newComponent) {
            newComponent.render(elem);
            newComponent.insert(elem);
        }
        
        this.detailComponent = newComponent;
    }
});
