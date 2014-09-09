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
                    [new Date(2), 5],
                    [new Date(4), 6],
                    [new Date(6), 7]
                ]
            }
        ]);
    });
    
    it("should produce correct x and y plot points", function() {
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
        
        expect(plotPoint(1, 0)).to.eql([2, 5]);
        expect(plotPoint(1, 1)).to.eql([4, 6]);
        expect(plotPoint(1, 2)).to.eql([6, 7]);
    });
});
