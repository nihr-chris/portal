var expect = require('chai').expect;
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;
var _ = require("underscore");

var DataSource = require("../src/modules/datasource.js");
var Fusion = require("../src/modules/fusion.js");

var fusionMock = require('./fusion.mock.js');

describe("DataSource", function() {
    var data;
    
    function shouldMakeQuery(params) {
        var expectedValues = params.query.values ? params.query.values : "EXPECTED";
        
        if (params.table) {
            params.query.values = expectedValues;
            params.table.stub(params.query);
        }
        
        return params.fn(params.inputValues)
            .then(function(values) {
                expect(values).to.eql(expectedValues);
            });
    }
    
    beforeEach(function(){
        data = new DataSource({
            trustTable: fusionMock.exampleOrgs(),
            recruitmentTable: fusionMock(),
            studyTable: fusionMock()
        });
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
            return shouldMakeQuery({
                table: data.studyTable,
                query: {
                    select: ["StudyID"],
                    where: [Fusion.eql("Commercial", 0)]
                },
                fn: data.getNonCommercialStudies()
            });
        });
    });
    
    describe("monthlyRecruitment", function() {
        var startDate = new Date(2011, 3, 1);
        var endDate = new Date(2012, 3, 1);
        
        var studyIDs = [1, 2];
        var studyIDRows = [{StudyID: 1}, {StudyID: 2}];
                
        describe("when grouping specified", function(){
           it("should return sum monthly recruitment, also grouped by specified fields", function() {
               
                return shouldMakeQuery({
                    table: data.recruitmentTable,
                    query: {
                        select: ["SUM(MonthRecruitment)", "Month", "StudyID"],
                        where: [
                            Fusion.between("Month", startDate, endDate),
                            Fusion.in("StudyID", studyIDs)
                        ],
                        groupBy: ["Month", "StudyID"]
                    },
                    fn: data.monthlyRecruitment(startDate, endDate, ["StudyID"]),
                    inputValues: studyIDRows
                });
           });
        });
                
        describe("when grouping not specified", function(){
           it("should return sum monthly recruitment, also grouped by specified fields", function() {
               
                return shouldMakeQuery({
                    table: data.recruitmentTable,
                    query: {
                        select: ["SUM(MonthRecruitment)", "Month"],
                        where: [
                            Fusion.between("Month", startDate, endDate),
                            Fusion.in("StudyID", _.values(studyIDs))
                        ],
                        groupBy: ["Month"]
                    },
                    fn: data.monthlyRecruitment(startDate, endDate),
                    inputValues: studyIDRows
                });
           });
        });
    });
    
    describe("accumulateByDate", function() {
        it("should accumulate count field over date field, grouping by other fields", function() {
            var input = [
                {a: "a", b: "a", Month: new Date(2011, 1, 1)},
                {a: "a", b: "b", Month: new Date(2011, 1, 1)},
            ];
            
            data.accumulateMonthly()().then
        });
    });
});
