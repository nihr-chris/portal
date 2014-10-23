var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;
var mock            = require("./mocks.js");

var Graph           = require("../src/modules/graph.js");

var _               = require("underscore");

describe("graph", function() {
    describe("barChart", function() {
        it("should produce graph with all options specified, summing values", function(){
            return expectOperation(Graph, function(parent) {
                return parent.barChart({
                    valueFrom: "val",
                    stackBy: "stack",
                    seriesBy: "series",
                    groupBy: "group"
                });
            })
            .withInput([
                {val: 5, stack: "st1", series: "s1", group: "g1"},
                {val: 6, stack: "st2", series: "s1", group: "g1"},
                
                {val: 1, stack: "st1", series: "s2", group: "g1"},
                {val: 2, stack: "st2", series: "s2", group: "g1"},
                
                
                {val: 10, stack: "st1", series: "s1", group: "g2"},
                {val: 5, stack: "st1", series: "s1", group: "g2"},
                {val: 10, stack: "st2", series: "s1", group: "g2"},
                {val: 6, stack: "st2", series: "s1", group: "g2"},
                
                {val: 11, stack: "st1", series: "s2", group: "g2"},
                {val: 12, stack: "st2", series: "s2", group: "g2"},
            ])
            .toReturn([
                {
                    key: "g1",
                    values: [
                        {
                            key: "s1",
                            values: [
                                {key: "st1", value: 5},
                                {key: "st2", value: 6}
                            ]
                        },
                        {
                            key: "s2",
                            values: [
                                {key: "st1", value: 1},
                                {key: "st2", value: 2}
                            ]
                        }
                    ]
                },
                {
                    key: "g2",
                    values: [
                        {
                            key: "s1",
                            values: [
                                {key: "st1", value: 15},
                                {key: "st2", value: 16}
                            ]
                        },
                        {
                            key: "s2",
                            values: [
                                {key: "st1", value: 11},
                                {key: "st2", value: 12}
                            ]
                        }
                    ]
                },
            ]);
        });
        
        it("should produce graph with no options specified, summing values", function() {
            return expectOperation(Graph, function(parent) {
                return parent.barChart({
                    valueFrom: "val"
                });
            })
            .withInput([
                {val: 5, stack: "st1", series: "s1", group: "g1"},
                {val: 6, stack: "st2", series: "s1", group: "g1"},
                
                {val: 1, stack: "st1", series: "s2", group: "g1"},
                {val: 2, stackc: "st2", series: "s2", group: "g1"},
                
                
                {val: 10, stack: "st1", series: "s1", group: "g2"},
                {val: 5, stack: "st1", series: "s1", group: "g2"},
                {val: 10, stack: "st2", series: "s1", group: "g2"},
                {val: 6, stack: "st2", series: "s1", group: "g2"},
                
                {val: 11, stack: "st1", series: "s2", group: "g2"},
                {val: 12, stack: "st2", series: "s2", group: "g2"},
            ])
            .toReturn([
                {
                    key: "",
                    values: [
                        {
                            key: "",
                            values: [
                                {key: "", value: 68},
                            ]
                        }
                    ]
                }
            ]);
        });
    });
});
