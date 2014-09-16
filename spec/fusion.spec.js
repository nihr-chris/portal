var expect = require('chai').expect;
var Fusion = require("../src/js/fusion.js");
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

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
    
    it("should encode equals string condition", function() {
        expect(Fusion.eql("f1", "1")).to.eql('f1 = "1"');
    });
    
    it("should fail for double-quoted string", function() {
        expect(function(){ Fusion.eql("f1", '"')}).to.throw();
    });
    
    it("should construct fetch request with filters and fields", function() {
        subject.fetch(["f1", "f2"], [Fusion.eql("f1", 1), Fusion.eql("f2", 2)]);
        
        expect(req.uri).to.eql(
            "https://www.googleapis.com/fusiontables/v1/query?"
            + "sql=" + encodeURIComponent("SELECT f1, f2 FROM MyTable WHERE f1 = 1 AND f2 = 2")
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
