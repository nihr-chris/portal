var expect = require('chai').expect;
var describe = global.describe,
    it = global.it,
    beforeEach = global.beforeEach;

var _ = require("underscore");
var barchart = require("../src/modules/barchart.utils.js");
var palette = require("../src/modules/palette.js");

describe('barchart utils', function() {
    function exampleChart() {
        return [
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
    }
    
    describe("legend", function() {
        it("should generate chart legend", function() {
            var chartData = exampleChart();
            var colors = palette.generate(["stack1", "stack2"]);
            
            expect(barchart.legend(chartData)).to.eql({
                stack1: colors.stack1,
                stack2: colors.stack2
            });
        });
    });
    
    describe("colorise", function() {
        it('should colorise the chart data', function() {
            var chartData = exampleChart();
            barchart.colorise(chartData, {stack1: "color1", stack2: "color2"});
            
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
                                    color: "color1"
                                },
                                {
                                    key: "stack2",
                                    value: 11,
                                    color: "color2"
                                }
                            ]
                        },
                        {
                            key: "bar2",
                            values: [
                                {
                                    key: "stack1",
                                    value: 10,
                                    color: "color1"
                                },
                                {
                                    key: "stack2",
                                    value: 11,
                                    color: "color2"
                                }
                            ]
                        }
                    ]
                }
            ]);
        });
    });
});
