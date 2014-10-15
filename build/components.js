var templates = {"overview.html":"","master-detail.html":"<div class='row'>\n    <div class='col-xs-4 sidebar'>\n        {{#options}}\n        <div class='row'>\n            <div class='col-xs-12'>\n                <a href='#' class='{{id === current ? \"active\" : \"inactive\"}}' on-click='optionSelected'>\n                    {{title}}\n                </a>\n            </div>\n        </div>\n        {{/#}}\n    </div>\n    <div class='col-xs-6' id='detail'>\n    </div>\n</div>\n","filter.html":"{{# rows}}\n<div class='row'>\n    <div class='col-sm-12'>\n        <div class=\"btn-toolbar filterrow datafilter\" role=\"toolbar\">\n            <div class='btn-group btn-group-xs'>\n                <button on-click='delete' type=\"button\" class=\"close\">\n                    <span aria-hidden=\"true\">&times;</span>\n                    <span class=\"sr-only\">Delete</span>  \n                </button>\n            </div>  \n            <div class='btn-group'>\n                <button type=\"button\" class=\"btn btn-xs colorindicator\" style='background-color:{{dataColor}}'>\n                </button>\n            </div>\n            <div class='btn-group'>\n                {{# this.filters() }}\n                <dropdown options='{{options}}' index='{{selectedIndex}}'/>\n                {{/}}\n            </div>\n        </div>\n    </div>\n</div>\n{{/rows}}\n\n<div class='row'>\n    <button on-click=\"insert\" type=\"button\" class=\"btn btn-default\">Add</button>\n</div>\n","dropdown.html":"<div class=\"btn-group btn-group-xs\">\n    <button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\">\n        {{ title ? title : (options[index].label ? options[index].label : \"\") }}\n        <span class=\"caret\"></span>\n    </button>\n    <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dropdownMenu1\">\n        {{# options }}\n        <li role=\"presentation\">\n            <a on-click='select' role=\"menuitem\" tabindex=\"-1\" href=\"#\">{{label}}</a>\n        </li>\n        {{/options}}\n    </ul>\n</div>\n","areachart.html":"<svg width=700 height=400>\n    {{# chart(model) }} \n    \n    <!--\n        Offset the graph so that we have space for labels and to pad the \n        top of the chart.\n    <-->\n    <g transform='translate( 25, {{ 25 - yscale(axisMax(model.y)) }} )'>\n        \n        <!-- Filled areas -->\n        {{# curves:index }}\n        <g>\n            <path class='chart-element chart-area' \n                d=\"{{ area.path.print() }}\" \n                fill='{{ model.color(index) }}' />\n        </g>\n        {{/}}\n        \n        \n        <!-- Lines -->\n        {{# curves:index }}\n        <g>\n            <path class='chart-element chart-line' \n                d=\"{{ line.path.print() }}\" \n                stroke='{{ model.color(index) }}' />\n        </g>\n        {{/}}\n        \n        \n        <!-- X Axis -->\n        <line class='chart-element chart-axis chart-x-axis' \n            stroke=\"black\" \n            x1=\"{{ xscale(axisMin(model.x)) }}\" \n            y1=\"{{ yscale(axisMin(model.y)) }}\" \n            x2=\"{{ xscale(axisMax(model.x)) }}\" \n            y2=\"{{ yscale(axisMin(model.y)) }}\" />\n        \n        {{# model.x.ticks }}\n        <!-- \n            Position the tick point and its label, translating from the \n            graph's coordinate system\n        -->\n        <g transform=\"translate({{ xscale(.) }},{{ yscale(axisMin(model.y)) }})\">\n        \n            <circle class='chart-element chart-axis-element chart-tick chart-x-tick' \n                r=\"2\" \n                cx=\"0\" \n                cy=\"0\" />\n                \n            <!-- position the text manually until we find a more elegant way... -->\n            <text class='chart-element chart-tick-text chart-x-tick-text' \n                transform='translate(0, 12)' \n                text-anchor=\"middle\">\n                {{ model.x.format(.) }}\n            </text>\n            \n        </g>\n        {{/}}\n        \n        \n        <!-- Y Axis -->\n        <line class='chart-element chart-axis chart-y-axis' \n            stroke=\"black\" \n            x1=\"{{ xscale(axisMin(model.x)) }}\" \n            y1=\"{{ yscale(axisMin(model.y)) }}\" \n            x2=\"{{ xscale(axisMin(model.x)) }}\" \n            y2=\"{{ yscale(axisMax(model.y)) }}\" />\n        \n        {{# model.y.ticks }}\n        <!-- \n            Position the tick point and its label, translating from the \n            graph's coordinate system\n        -->\n        <g transform=\"translate({{ xscale(axisMin(model.x)) }},{{ yscale(.) }})\">\n        \n            <circle class='chart-element chart-tick chart-y-tick' \n                r=\"2\" \n                cx=\"0\" \n                cy=\"0\" />\n                \n            <!-- position the text manually until we find a more elegant way... -->\n            <text class='chart-element chart-tick-text chart-y-tick-text' \n                transform=\"translate(-6, 4)\" \n                text-anchor=\"end\">\n                {{ model.y.format(.) }}\n            </text>\n            \n        </g>\n        {{/}}\n    </g>\n    {{/}}\n</svg>\n"}; module.exports = function(name) { return templates[name] };(function() {})();(function() {/**
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
})();(function() {var Ractive = require("ractive");
var template = require("template");
var log = require("loglevel");

Ractive.components.filter = Ractive.extend({
    template: template('filter.html'),
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
})();(function() {var Ractive = require("ractive");
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
})();(function() {/**
 * Defines an area chart component, created using the <areachart> element.
 * 
 * Chart content is supplied via the 'model' attribute.
 * See areachart.model.timeseries.js for a documented example.
 */
 
var Ractive = require("ractive");
var template = require("template");

Ractive.components.areachart = Ractive.extend({
    template: template('areachart.html'),
    init: function () {
      
    },
    data: {
        axisMin:function(axis){ return axis.ticks[0]; },
        axisMax:function(axis){ return axis.ticks[axis.ticks.length - 1]; },
        chart: require('paths-js/smooth-line')
    },
    isolated: true
});
})();