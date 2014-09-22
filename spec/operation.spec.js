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
    var startDate = new Date(2011, 1, 2);
    var endDate = new Date(2011, 3, 2);
    
    var HLOStudyFields = ["StudyID", "TrustID", "FullTitle", "Banding", "ActualStartDate", "ExpectedEndDate", "ActualEndDate"];
        
    describe("getHLO1Studies", function() {
        it("should fetch studies", function() {
            return expectOperation(function(parent) {
                return parent.getHLO1Studies({
                    startDate: startDate,
                    endDate: endDate
                });
            })
            .toMakeQuery({
                select: ["StudyID"],
                where: [
                    Fusion.lt("ActualStartDate", endDate),
                    Fusion.or(Fusion.eql("ActualEndDate", null), Fusion.gte("ActualEndDate", startDate))
                ],
                groupBy: ["StudyID"]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
    });
        
    describe("getHLO2Studies", function() {
        it("should fetch HLO2a(closed) query", function() {
            return expectOperation(function(parent){
                return parent.getHLO2Studies({
                    startDate: startDate,
                    endDate: endDate,
                    commercial: true,
                    closed: true
                });
            })
            .toMakeQuery({
                select: HLOStudyFields,
                where: [
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-04-01")),
                    Fusion.eql("Commercial", 1),
                    Fusion.notIn("RecruitmentInformationStatus", ["No NHS Support", "Sample Data: No Consent Requested"]),
                    Fusion.in("ActiveStatus", ["Closed - in follow-up", "Closed - follow-up complete"]),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.between("ActualEndDate", startDate, endDate)
                ]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
        
        it("should fetch HLO2a(open) query", function() {
            return expectOperation(function(parent){
                return parent.getHLO2Studies({
                    startDate: startDate,
                    endDate: endDate,
                    commercial: true,
                    closed: false
                });
            })
            .toMakeQuery({
                select: HLOStudyFields,
                where: [
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-04-01")),
                    Fusion.eql("Commercial", 1),
                    Fusion.notIn("RecruitmentInformationStatus", ["No NHS Support", "Sample Data: No Consent Requested"]),
                    Fusion.eql("ActiveStatus", "Open"),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.gte("ActualStartDate", new Date("2010-04-01"))
                ]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
        
        it("should fetch HLO2b query", function() {
            return expectOperation(function(parent){
                return parent.getHLO2Studies({
                    startDate: startDate,
                    endDate: endDate,
                    commercial: false,
                    closed: true
                });
            })
            .toMakeQuery({
                select: HLOStudyFields,
                where: [
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-04-01")),
                    Fusion.eql("Commercial", 0),
                    Fusion.notIn("RecruitmentInformationStatus", ["No NHS Support", "Sample Data: No Consent Requested"]),
                    Fusion.in("ActiveStatus", ["Closed - in follow-up", "Closed - follow-up complete"]),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.between("ActualEndDate", startDate, endDate)
                ]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
    });
    
    describe("monthlyRecruitment", function() {
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
     
     describe("with", function() {
         it("should add literal value", function() {
            return expectOperation(function(parent){
                return parent.with({
                    value: "myValue",
                    inField: "myField"
                });
            })
            .withInput([{StudyID: 1}, {StudyID: 2}])
            .toReturn([
                {StudyID: 1, myField: "myValue"}, 
                {StudyID: 2, myField: "myValue"}
            ]);
         });
         
         it("should add field value", function() {
            return expectOperation(function(parent){
                return parent.with({
                    valueOfField: "a",
                    inField: "b"
                });
            })
            .withInput([{a: 1}, {a: 2}])
            .toReturn([
                {a: 1, b: 1}, 
                {a: 2, b: 2}
            ]);
         });
     });
     
     describe("withNameOfTrust", function() {
         it("should add trust name", function() {
            return expectOperation(function(parent){
                return parent.withNameOfTrust({
                    fromField: "trustID",
                    inField: "trustName"
                });
            })
            .withInput([{trustID: 1}, {trustID: 2}])
            .toReturn([
                {trustID: 1, trustName: "Org1"}, 
                {trustID: 2, trustName: "Org2"}
            ]);
         });
     });
});
