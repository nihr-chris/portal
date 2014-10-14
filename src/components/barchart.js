var Ractive = require('ractive');
var d3 = require('d3');
var _ = require('underscore');
var util = require ('../modules/util.js');

// copypasta: http://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

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
            .attr("class", "x0 axis");

        dataView.append("g")
            .attr("class", "y axis")
            .append("text")
            ;
    },
    
    updateGraph: function(data) {
        console.log(data);
        
        var allBarData = _.flatten(_.map(data, "values"), true);
        var allXValues = _.map(allBarData, function(d){ return d.key });
        var allYValues = _.map(allBarData, function(d){ return _.reduce(d.values, function(memo, x){ return memo + x.value }, 0) });
        
        var maxY = _.max(allYValues);
        
        var biggestGroup = _.max(data, function(d){ return d.values.length });
        var numBars = biggestGroup.values.length * data.length;
        
        var width = this.get("barWidth") * numBars;
        var height = this.get("height");
        
        
        // Scales
        
        var y = d3.scale.linear()
            .domain([0, maxY])
            .range([height, 0])
            ;
            
        var x0 = d3.scale.ordinal()
            .domain(_.map(data, "key").sort())
            .rangeRoundBands([0, width], 0.05)
            ;
        
        var x1 = d3.scale.ordinal()
            .domain(_.uniq(allXValues).sort())
            .rangeRoundBands([0, x0.rangeBand()])
            ;
            
            
        // Chart
        
        var chart = this.containerElement().select("svg");
        var dataView = chart.select(".dataView");
        
        chart.attr("width", width + (this.xPad * 2))
            .attr("height", height + (this.yPad * 2));
            
            
        // Axes
            
        var x0Axis = d3.svg.axis()
            .scale(x0)
            .orient("bottom")
            ;
            
        dataView.select(".x0.axis")
            .attr("transform", "translate(0," + (height + 15) + ")")
            .call(x0Axis)
            .selectAll(".tick text")
                .call(wrap, x0.rangeBand())
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
        
        var x1Axis = d3.svg.axis()
            .scale(x1)
            .orient("bottom")
            ;
            
        groupRepresentation.enter()
            .append("g")
                .attr("class", "group")
                .append("g")
                    .attr("class", "x1 axis");
        
        groupRepresentation
            .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; })
            .select("g.x1")
                .attr("transform", "translate(0," + height + ")")
                .call(x1Axis)
                .selectAll(".tick text")
                    .call(wrap, x1.rangeBand());
            
        groupRepresentation.exit().remove();
        
        
        var barRepresentation = groupRepresentation.selectAll("g.bar")
            .data(
                function(d){ return d.values },
                function(d){ return d.key; }
            );
        
        barRepresentation.enter().append("g").attr("class", "bar");
            
        barRepresentation
            .attr("transform", function(d) { return "translate(" + x1(d.key) + ",0)"; })
            ;
            
        barRepresentation.exit().remove();
            
            
        function stackedBitPresentationData(data) {
            var result = [], start = 0;
            
            _.each(data, function(d, i){ 
                result.push({
                    startVal: start,
                    color: d.color,
                    value: d.value
                });
                start += d.value;
            });
            
            return result;
        }
        
        var stackedBitRepresentation = barRepresentation.selectAll("rect.stackBit")
            .data(
                function(d){ return stackedBitPresentationData(d.values) },
                function(d){ return d.color }
            );
            
        stackedBitRepresentation.enter().append("rect")
            .attr("class", "stackBit");
            
        stackedBitRepresentation
            .style("fill", function(d){ 
                return d.color; 
            })
            .attr("width", function(){
                return x1.rangeBand() - 1;
            })
            .attr("height", function(d){ 
                return height - y(d.value);
            })
            .attr("x", 0)
            .attr("y", function(d){ 
                return y(d.value + d.startVal);
            });
            
        stackedBitRepresentation.exit().remove();
    },
    
    data: {
        height: 200,
        barWidth: 75,
        'y-label': "",
        'x-format': _.identity,
        'y-format': _.identity,
        'group-spacing': 0,
        stacked: false,
        makeID: util.uid
    }
});
