var expect = require('chai').expect;
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

var ReportContext = require("../src/modules/report-context.js");

describe("ReportContext", function() {
    var ctx;
    
    beforeEach(function(){
        ctx = ReportContext.testContext();
        return ctx.waitForLoad;
    });
    
    it("should return trust name", function() {
        expect(ctx.trustName(1)).to.eql("Org1");
    });
    
    it("should return trust id", function() {
        expect(ctx.trustID("Org1")).to.eql(1);
    });
});
