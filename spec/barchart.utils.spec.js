var expect = require('chai').expect;
var describe = global.describe,
    it = global.it,
    beforeEach = global.beforeEach;

var _ = require("underscore");
var barchart = require("../src/modules/barchart.utils.js");
var palette = require("../src/modules/palette.js");

describe('barchart utils', function() {
    describe("colorise", function() {
        it('should colorise the chart data', function() {
            var chartData = [
                {
                    key: "group1",
                    values: [
                        {
                            key: "bar1",
                            values: [
                                {
                                    key: "stack1",
                                    value: 10
                                },
                                {
                                    key: "stack2",
                                    value: 11
                                }
                            ]
                        },
                        {
                            key: "bar2",
                            values: [
                                {
                                    key: "stack1",
                                    value: 10
                                },
                                {
                                    key: "stack2",
                                    value: 11
                                }
                            ]
                        }
                    ]
                }
            ];
            
            var expectedColors = palette.generate(["1", "2"]);
            barchart.colorise(chartData);
            
            expect(chartData).to.eql([
                {
                    key: "group1",
                    values: [
                        {
                            key: "bar1",
                            values: [
                                {
                                    key: "stack1",
                                    value: 10,
                                    color: expectedColors[1]
                                },
                                {
                                    key: "stack2",
                                    value: 11,
                                    color: expectedColors[2]
                                }
                            ]
                        },
                        {
                            key: "bar2",
                            values: [
                                {
                                    key: "stack1",
                                    value: 10,
                                    color: expectedColors[1]
                                },
                                {
                                    key: "stack2",
                                    value: 11,
                                    color: expectedColors[2]
                                }
                            ]
                        }
                    ]
                }
            ]);
        });
    });
});
