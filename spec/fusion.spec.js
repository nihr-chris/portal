var expect = require('chai').expect;
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

var Fusion = require("../src/modules/fusion.js");

describe("Fusion", function() {
    Fusion.APIKey = "myKey";
    var req, cb, subject;
    
    beforeEach(function() {
        subject = new Fusion("MyTable", function(r, c) {
            req = r; cb = c;
        }); 
    });
    
    it("should encode equals number condition", function() {
        expect(Fusion.eql("f1", 1)).to.eql('f1 = 1');
    });
    
    it("should encode equals date condition", function() {
        expect(Fusion.eql("f1", new Date(2011, 0, 2))).to.eql('f1 = 2011.01.02');
    });
    
    it("should encode equals string condition", function() {
        expect(Fusion.eql("f1", "1")).to.eql('f1 = "1"');
    });
    
    it("should fail for double-quoted string", function() {
        expect(function(){ Fusion.eql("f1", '"')}).to.throw();
    });
    
    it("should construct fetch request with filters, fields and groupings", function() {
        subject.fetch({
            select: ["f1", "f2", "f3"], 
            where: [Fusion.eql("f1", 1), Fusion.eql("f2", 2)],
            groupBy: ["f1", "f3"]
        });
        
        expect(req.uri).to.eql(
            "https://www.googleapis.com/fusiontables/v1/query?"
            + "sql=" + encodeURIComponent("SELECT f1, f2, f3 FROM MyTable WHERE f1 = 1 AND f2 = 2 GROUP BY f1, f3")
            + "&key=myKey"
        );
    });
    
    it("should construct fetch request for all fields, unfiltered by default", function() {
        subject.fetch();
        
        expect(req.uri).to.eql(
            "https://www.googleapis.com/fusiontables/v1/query?"
            + "sql=" + encodeURIComponent("SELECT * FROM MyTable")
            + "&key=myKey"
        );
    });
});
