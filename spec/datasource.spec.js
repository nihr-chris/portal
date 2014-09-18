var expect = require('chai').expect;
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

var DataSource = require("../src/modules/datasource.js");
var Fusion = require("../src/modules/fusion.js");

var fusionMock = require('./fusion.mock.js');

describe("DataSource", function() {
    var data;
    
    beforeEach(function(){
        data = new DataSource(fusionMock.exampleOrgs(), fusionMock(), fusionMock());
        return data.waitForLoad;
    });
    
    describe("Trust Mapping", function() {
        it("should return trust name", function() {
            expect(data.trustName(1)).to.eql("Org1");
        });
        
        it("should return trust id", function() {
            expect(data.trustID("Org1")).to.eql(1);
        });
    });
    
    describe("getNonCommercialStudies", function() {
        it("should fetch only noncommercial studies", function() {
            
        });
    });
});
