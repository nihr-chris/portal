var expect      = require('chai').expect;
var describe    = global.describe, it = global.it, beforeEach = global.beforeEach;

var _           = require("underscore");
var Promise     = require("promise");

var DataSource  = require("../src/modules/datasource.js");
var Operation   = require("../src/modules/operation.js");
var mocks       = require("./mocks.js");


describe("Operation", function(){
    var data = mocks.dataSource();
    
    var rootOperation;
    
    beforeEach(function(){
        rootOperation = new Operation({
            dataSource: data,
            outputColumns: ["A", "B"],
            promise: Promise.resolve("result")
        });
    });
    
    describe("a root operation", function() {
        it("should vend the DataSource", function() {
            expect(rootOperation.dataSource).to.equal(data);
        });
        it("should vend the outputColumns", function() {
            expect(rootOperation.outputColumns).to.eql(["A", "B"]);
        });
        
        it("should resolve to value", function(done) {
            rootOperation.onCompleted(function(x) {
                expect(x).to.eql("result");
                done();
            });
        });
    });
    
    it("should throw error when creating child operation that requires columns not returned by parent", function() {
        expect(function() {
            rootOperation.childOperation({
                inputColumns: ["C"],
                outputColumns: ["B"],
                transform: function(){}
            });
        }).to.throw(Error);
    });
    
    describe("a child operation", function() {
        var childOperation;
        
        beforeEach(function(){
            childOperation = rootOperation.childOperation({
                inputColumns: ["A"],
                outputColumns: ["B"],
                transform: function(x){
                    return x.toUpperCase();
                }
            });
        });
        
        it("should vend the DataSource", function() {
            expect(childOperation.dataSource).to.equal(data);
        });
        
        it("should resolve to value", function(done) {
            childOperation.onCompleted(function(x) {
                expect(x).to.eql("RESULT");
                done();
            });
        });
    });
});
