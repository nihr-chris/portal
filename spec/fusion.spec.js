var expect = require('chai').expect;
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

var Fusion = require("../src/modules/fusion.js");

describe("Fusion", function() {
    Fusion.APIKey = "myKey";
    var subject, req, handleRequest;
    
    beforeEach(function() {
        subject = new Fusion("MyTable", function(r, next) {
            req = r;
            handleRequest(r, next);
        }); 
    });
    
    it("should encode equals number condition", function() {
        expect(Fusion.eql("f1", "1")).to.eql("f1 = '1'");
    });
    
    it("should encode between condition", function() {
        expect(Fusion.between("f1", "a", "b")).to.eql("f1 >= 'a' AND f1 < 'b'");
    });
    
    it("should encode lt condition", function() {
        expect(Fusion.lt("f1", "1")).to.eql("f1 < '1'");
    });
    
    it("should encode gte condition", function() {
        expect(Fusion.gte("f1", "1")).to.eql("f1 >= '1'");
    });
    
    it("should encode in condition", function() {
        expect(Fusion.in("f1", ["a", "b"])).to.eql("f1 IN ('a', 'b')");
    });
    
    it("should encode not equal condition", function() {
        expect(Fusion.notEql("f1", "a")).to.eql("f1 NOT EQUAL TO 'a'");
    });
    
    it("should encode greater than condition", function() {
        expect(Fusion.gt("f1", 1)).to.eql("f1 > 1");
    });
    
    it("should encode equals date condition", function() {
        expect(Fusion.eql("f1", new Date(2011, 0, 2))).to.eql("f1 = '2011.01.02'");
    });
    
    it("should encode equals null condition", function() {
        expect(Fusion.eql("f1", null)).to.eql("f1 = ''");
    });
    
    it("should encode equals string condition", function() {
        expect(Fusion.eql("f1", "1")).to.eql("f1 = '1'");
    });
    
    it("should escape strings", function() {
        expect(Fusion.eql("f1", "''")).to.eql("f1 = '\\'\\''");
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
    
    it("should convert result rows into array of maps", function() {
        handleRequest = function(req, next) {
            next(null, null, {
                columns: ["c1", "c2", "c3"],
                rows: [
                    [1, 2, 3],
                    [4, 5, 6]
                ]
            });
        };
        
        return subject.fetch().then(function(result) {
            expect(result).to.eql([
                {c1: 1, c2: 2, c3: 3},
                {c1: 4, c2: 5, c3: 6}
            ]);
        });
    });
    
    it("should convert date strings into JS dates", function() {
        handleRequest = function(req, next) {
            next(null, null, {
                columns: ["d"],
                rows: [
                    ["28/02/2013 00:00:00"]
                ]
            });
        };
        
        return subject.fetch().then(function(result) {
            expect(result).to.eql([
                {d: new Date("2013-02-28")}
            ]);
        });
    });
    
    it("should convert numeric strings into JS numbers", function() {
        handleRequest = function(req, next) {
            next(null, null, {
                columns: ["d"],
                rows: [
                    ["123"]
                ]
            });
        };
        
        return subject.fetch().then(function(result) {
            expect(result).to.eql([
                {d: 123}
            ]);
        });
    });
    
    it("should keep strings as JS strings", function() {
        handleRequest = function(req, next) {
            next(null, null, {
                columns: ["d"],
                rows: [
                    ["a"]
                ]
            });
        };
        
        return subject.fetch().then(function(result) {
            expect(result).to.eql([
                {d: "a"}
            ]);
        });
    });
});
