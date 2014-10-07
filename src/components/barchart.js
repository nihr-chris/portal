var Ractive = require('ractive');
var d3 = require('d3');
var _ = require('underscore');
var util = require ('../modules/util.js');

Ractive.components.barchart = Ractive.extend({
    template: "<div class='multibar' id='multibar{{ makeID() }}'></div>",
    
    init: function() {
        var component = this;
        var observedKeys ='data height group-spacing x-format y-format stacked';
        
        component.observe(observedKeys, function(oldval, newval) {
            if (newval) {
                component.update(component.get("data"));
            }
        });
        
        component.renderGraph(component.get("data"));
    },
    
    elementID: function() {
        return _.keys(this.nodes)[0];
    },
    
    renderGraph: function(data) {
        var xPad = 50;
        var yPad = 60;
        
        var allBarData = _.flatten(_.map(data, "values"), true);
        var allXValues = _.uniq(_.map(allBarData, function(pair){ return pair[0] }));
        var allYValues = _.uniq(_.map(allBarData, function(pair){ return pair[1] }));
        
        var width = this.get("width");
        var height = this.get("height");
        var maxY = _.max(allYValues);
        
        var chart = d3.select("#" + this.elementID())
            .append("svg")
            .attr("width", width + xPad * 2)
            .attr("height", height + yPad * 2)
            .append("g")
            .attr("transform", "translate(" + xPad + "," + yPad + ")")
            ;
            
            
        // Scales
            
        var y = d3.scale.linear()
            .domain([0, maxY])
            .range([height, 0])
            ;
            
        var x0 = d3.scale.ordinal()
            .domain(_.map(data, "key"))
            .rangeRoundBands([0, width], 0.1)
            ;
        
        var x1 = d3.scale.ordinal()
            .domain(allXValues)
            .rangeRoundBands([0, x0.rangeBand()])
            ;
            
        
        // Axes
        
        var xAxis = d3.svg.axis()
            .scale(x0)
            .orient("bottom")
            ;
            
        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            ;
        
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(maxY)
            ;

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(this.get("y-label"))
            ;
            
            
        // Data Representations
            
        var group = chart.selectAll(".group")
            .data(data)
            .enter()
                .append("g")
                .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; })
            ;
        
        group.selectAll("rect")
            .data(function(d){ return d.values})
            .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { 
                    return x1(d[0]);
                })
                .attr("y", function(d){ 
                    return y(d[1]);
                })
                .attr("width", function(){
                    return x1.rangeBand();
                })
                .attr("height", function(d){ 
                    return height - y(d[1]);
                })
            ;
    },
    
    data: {
        width: 600,
        height: 100,
        'y-label': "",
        'x-format': _.identity,
        'y-format': _.identity,
        'group-spacing': 0,
        stacked: false,
        makeID: util.uid
    }
});
