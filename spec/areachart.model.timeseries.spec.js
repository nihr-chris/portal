var expect = require('chai').expect;
var timeseries = require("../src/js/areachart.model.timeseries.js");
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

describe("arechart timeseries", function() {
    var example;
    beforeEach(function() {
        example = timeseries([
            {
                color: "#FFF",
                points: [
                    [new Date(2), 13],
                    [new Date(4), 12],
                    [new Date(6), 15]
                ]
            },
            {
                color: "#000",
                points: [
                    [new Date(3), 5],
                    [new Date(6), 6],
                    [new Date(9), 7]
                ]
            }
        ]);
    });
    
    it("should return correct x and y plot points", function() {
        function plotPoint(series, index) { 
            var dataPoints = example.data[series];
            return [
                example.xaccessor(dataPoints[index]), 
                example.yaccessor(dataPoints[index])
            ];
        }
        
        expect(plotPoint(0, 0)).to.eql([2, 13]);
        expect(plotPoint(0, 1)).to.eql([4, 12]);
        expect(plotPoint(0, 2)).to.eql([6, 15]);
        
        expect(plotPoint(1, 0)).to.eql([3, 5]);
        expect(plotPoint(1, 1)).to.eql([6, 6]);
        expect(plotPoint(1, 2)).to.eql([9, 7]);
    });
    
    it("should return all plotted x locations as tick points", function() {
        expect(example.x.ticks).to.eql([2,3,4,6,9]);
    });
    
    it("should format x ticks as human-readable month", function() {
        expect(example.x.format( new Date(2001, 0, 1).getTime() )).to.eql("Jan-01");
    });
    
    it("should return all plotted y locations as tick points", function() {
        expect(example.y.ticks).to.eql([5,6,7,12,13,15]);
    });
    
    it("should format y ticks as human-readable number", function() {
        expect(example.y.format(1234)).to.eql("1,234");
    });
    
    it("should return correct series colors", function() {
        expect(example.color(0)).to.eql("#FFF");
        expect(example.color(1)).to.eql("#000");
    });
});
