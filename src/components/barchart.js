var Ractive = require('ractive');
var d3 = require('d3');
var _ = require('underscore');
var util = require ('../modules/util.js');

Ractive.components.barchart = Ractive.extend({
    template: "<div class='chart barchart' id='multibar{{ makeID() }}'></div>",
    
    init: function() {
        var component = this;
        var observedKeys ='data height group-spacing x-format y-format stacked';
        
        component.observe(observedKeys, function(oldval, newval) {
            if (newval && oldval) component.renderGraph();
        });
        
        component.renderGraph();
    },
    
    elementID: function() {
        return _.keys(this.nodes)[0];
    },
    
    renderGraph: function() {
        var data = this.get("data") || [];
        var legendData = this.get("legend") || [];
        
        var xPad = 50;
        var yPad = 60;
        
        var allBarData = _.flatten(_.map(data, "values"), true);
        var allXValues = _.uniq(_.map(allBarData, function(d){ return d.key }));
        var allYValues = _.uniq(_.map(allBarData, function(d){ return _.reduce(d.values, function(memo, x){ return memo + x.value }, 0) }));
        
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
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { 
                    return x1(d.key);
                })
                .attr("y", function(d){ 
                    return y(d.values[0].value);
                })
                .attr("width", function(){
                    return x1.rangeBand();
                })
                .attr("height", function(d){ 
                    return height - y(d.values[0].value);
                })
                .style("fill", function(d){ return d.values[0].color; })
            ;
            
            
        // Legend
            
        var legend = chart.selectAll(".legend")
            .data(legendData)
            .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(0," + i * 20 + ")";
                });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d){ return d.color; });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d){ return d.key });
    },
    
    data: {
        width: 600,
        height: 200,
        'y-label': "",
        'x-format': _.identity,
        'y-format': _.identity,
        'group-spacing': 0,
        stacked: false,
        makeID: util.uid
    }
});
