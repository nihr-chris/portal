var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;

var _               = require("underscore");
var Promise         = require("promise");

var DataSource      = require("../src/modules/datasource.js");
var Fusion          = require("../src/modules/fusion.js");
var Operation       = require("../src/modules/operation.js");
var mocks           = require("./mocks.js");
var expectOperation = require("./operation.helpers.js").expectOperation;


describe("any Operation", function(){
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

describe("Common Operation", function() {
    describe("monthlyRecruitment", function() {
        var startDate = new Date(2011, 1, 2);
        var endDate = new Date(2011, 3, 2);
          
        describe("when forEach is specified", function(){
            it("should fetch total monthly recruitment, grouped by specified fields", function() {
                return expectOperation(function(parent){
                    return parent.monthlyRecruitment({
                        forEach: ["StudyID"],
                        from: startDate,
                        until: endDate
                    });
                })
                .withInput([{StudyID: 1}, {StudyID: 2}])
                .toMakeQuery({
                    select: ["SUM(MonthRecruitment) AS RecruitmentCount", "Month", "StudyID"],
                    where: [
                        Fusion.between("Month", startDate, endDate),
                        Fusion.in("StudyID", [1,2])
                    ],
                    groupBy: ["Month", "StudyID"],
                })
                .onTable("recruitmentTable")
                .andReturnQueryResults();
            });
        });
          
        describe("when forEach is not specified", function(){
            it("should fetch network-wide total monthly recruitment", function() {
                return expectOperation(function(parent){
                    return parent.monthlyRecruitment({
                        from: startDate,
                        until: endDate
                    });
                })
                .withInput([{StudyID: 1}, {StudyID: 2}])
                .toMakeQuery({
                    select: ["SUM(MonthRecruitment) AS RecruitmentCount", "Month"],
                    where: [
                        Fusion.between("Month", startDate, endDate),
                        Fusion.in("StudyID", [1,2])
                    ],
                    groupBy: ["Month"],
                })
                .onTable("recruitmentTable")
                .andReturnQueryResults();
            });
        });
     });
});
