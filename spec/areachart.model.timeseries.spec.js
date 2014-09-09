var expect = require('chai').expect;
var timeseries = require("../src/js/areachart.model.timeseries.js");
var describe = window.describe,
    it = window.it,
    beforeEach = window.beforeEach;

describe("arechart timeseries", function() {
    var example;
    beforeEach(function() {
        example = timeseries([
            {
                color: "#FFF",
                points: [
                    [new Date(2012, 1, 13), 13],
                    [new Date(2012, 2, 13), 12],
                    [new Date(2012, 3, 13), 15]
                ]
            },
            {
                color: "#000",
                points: [
                    [new Date(2012, 1, 13), 5],
                    [new Date(2012, 2, 13), 6],
                    [new Date(2012, 3, 13), 7]
                ]
            }
        ]);
    });
    
    it("should format")
});
