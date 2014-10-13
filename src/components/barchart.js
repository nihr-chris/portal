var Ractive = require('ractive');
var d3 = require('d3');
var _ = require('underscore');
var util = require ('../modules/util.js');

Ractive.components.barchart = Ractive.extend({
    template: "<div class='chart barchart' id='multibar{{ makeID() }}'></div>",
    
    init: function() {
        var component = this;
        var observedKeys = ['data', 'height', 'group-spacing', 'x-format', 'y-format', 'stacked'];
        
        component.observe(observedKeys.join(" "), function(newval, oldval) {
            if (!_.isUndefined(oldval)) component.load();
        });
        
        component.setupGraph();
        component.load();
    },
    
    containerElement: function() {
        var id = _.keys(this.nodes)[0];
        return d3.select("#" + id);
    },
    
    load: function() {
        var component = this;
        Promise.resolve(this.get("data")).then(function(data) {
            if (data) component.updateGraph(data);
        });
    },
    
    xPad: 50,
    yPad: 60,
    
    setupGraph: function() {
        var chart = this.containerElement().append("svg");
        
        var dataView = chart.append("g")
            .attr("class", "dataView")
            .attr("transform", "translate(" + this.xPad + "," + this.yPad + ")");
            
        dataView.append("g")
            .attr("class", "x axis");

        dataView.append("g")
            .attr("class", "y axis")
            .append("text")
            ;
    },
    
    updateGraph: function(data) {
        var allBarData = _.flatten(_.map(data, "values"), true);
        var allXValues = _.uniq(_.map(allBarData, function(d){ return d.key }));
        var allYValues = _.uniq(_.map(allBarData, function(d){ return _.reduce(d.values, function(memo, x){ return memo + x.value }, 0) }));
        
        var maxY = _.max(allYValues);
        var width = this.get("width");
        var height = this.get("height");
        
        
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
            
            
        // Chart
        
        var chart = this.containerElement().select("svg");
        var dataView = chart.select(".dataView");
        
        chart.attr("width", width + (this.xPad * 2))
            .attr("height", height + (this.yPad * 2));
            
            
        // Axes
            
        var xAxis = d3.svg.axis()
            .scale(x0)
            .orient("bottom")
            ;
            
        dataView.select(".x.axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            ;
            
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            ;
            
        dataView.select(".y.axis")
            .call(yAxis)
            .select("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(this.get("y-label"))
            ;
            
            
        // Data Representations
            
        var groupRepresentation = dataView.selectAll("g.group")
            .data(data, function(d){ return d.key });
        
        groupRepresentation.enter()
            .append("g")
            .attr("class", "group")
            .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; })
            ;
            
        groupRepresentation.exit().remove();
        
        
        var barRepresentation = groupRepresentation.selectAll("rect.bar")
            .data(
                function(d){ return d.values },
                function(d){ return d.key; }
            );
        
        barRepresentation.enter().append("rect")
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
            
        barRepresentation.exit().remove();
            
            
        // // Legend
            
        // var legend = chart.selectAll(".legend")
        //     .data(legendData)
        //     .enter().append("g")
        //         .attr("class", "legend")
        //         .attr("transform", function(d, i) {
        //             return "translate(0," + i * 20 + ")";
        //         });

        // legend.append("rect")
        //     .attr("x", width - 18)
        //     .attr("width", 18)
        //     .attr("height", 18)
        //     .style("fill", function(d){ return d.color; });

        // legend.append("text")
        //     .attr("x", width - 24)
        //     .attr("y", 9)
        //     .attr("dy", ".35em")
        //     .style("text-anchor", "end")
        //     .text(function(d){ return d.key });
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
