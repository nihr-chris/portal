var expect = require('chai').expect;
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

var _ = require("underscore");
var recruitment = require("../src/modules/recruitment.data.js");

function testRow(net, div, sp, si, date, val) {
    return {
        net: "net" + net,
        div: "div" + div,
        sp: "sp" + sp,
        si: "si" + si,
        date: date,
        val: val
    };
}

var testData = [
    // match network
    testRow(1, 0, 0, 0, new Date(2001, 2, 1), 3),
    testRow(1, 0, 0, 0, new Date(2001, 2, 1), 5),
    testRow(1, 0, 0, 0, new Date(2001, 3, 1), 4)
];

describe("recruitment data", function() {
    var example;
    beforeEach(function(){
        example = new recruitment.DataStore(testData);
    });
    
    var all = recruitment.all();
    
    it("should present data filtered by network", function() {
        example.addSeries(
            recruitment.series("#000", recruitment.filterNetwork("net1"), all, all, all)
        );
        
        var report = example.byMonthReport()[0];
        
        expect(report.points[0]).to.eql([new Date(2001, 2, 1), 8]);
        expect(report.points[1]).to.eql([new Date(2001, 3, 1), 4]);
    });
});
