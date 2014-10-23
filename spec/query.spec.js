var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;
var mock            = require("./mocks.js");

var Fusion          = require("../src/modules/fusion.js");
var Query           = require("../src/modules/query.js");

var _               = require("underscore");

describe("data", function() {
    describe("fetchRecruitment", function() {
        it("should select all by default", function() {
            return expectOperation(Query, function(parent){
                return parent.fetchRecruitment({
                    filter: {x: [], y: []},
                    groupBy: ["a", "b"]
                });
            })
            .toMakeQuery({
                select: [
                    "SUM(Recruitment) AS MonthRecruitment",
                    "a",
                    "b"
                ],
                groupBy: [
                    "a",
                    "b"
                ]
            })
            .onTable("recruitmentTable")
            .andReturnQueryResults();
        });
        
        it("should filter when filter specified", function() {
            return expectOperation(Query, function(parent){
                return parent.fetchRecruitment({
                    filter: {x: [1, 2], y: [3, 4]},
                    groupBy: ["a", "b"]
                });
            })
            .toMakeQuery({
                select: [
                    "SUM(Recruitment) AS MonthRecruitment",
                    "a",
                    "b"
                ],
                where: [
                    Fusion.in("x", [1, 2]),
                    Fusion.in("y", [3, 4])
                ],
                groupBy: [
                    "a",
                    "b"
                ]
            })
            .onTable("recruitmentTable")
            .andReturnQueryResults();
        });
    });
    
    describe("timeTargetStudyInfo", function() {
        it("should fetch open commercial studies", function() {
            return expectOperation(Query, function(parent) {
                return parent.timeTargetStudyInfo({
                    open: true,
                    commercial: true,
                    financialYear: 2012
                });
            })
            .toMakeQuery({
                select: [
                    "PortfolioStudyID",
                    "MemberOrg",
                    "ExpectedEndDate", 
                    "StartDate", 
                    "ActualEndDate", 
                    "ExpectedRecruitment", 
                    "SUM(Recruitment) AS ActualRecruitment"
                ],
                where: [
                    Fusion.gte("Month", new Date("2011-4-1")),
                    Fusion.eql("CommercialStudy", "Commercial"),
                    Fusion.eql("ActiveStatus", "Open"),
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-4-1")),
                    Fusion.gte("StartDate", new Date("2010-4-1")),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.gt("ExpectedRecruitment", 0)
                ],
                groupBy: [
                    "PortfolioStudyID",
                    "MemberOrg",
                    "ExpectedEndDate", 
                    "StartDate", 
                    "ActualEndDate", 
                    "ExpectedRecruitment"
                ]
            })
            .onTable("recruitmentTable")
            .andReturnQueryResults();
        });
        
        it("should fetch closed commercial studies", function() {
            return expectOperation(Query, function(parent) {
                return parent.timeTargetStudyInfo({
                    open: false,
                    commercial: true,
                    financialYear: 2012
                });
            })
            .toMakeQuery({
                select: [
                    "PortfolioStudyID",
                    "MemberOrg",
                    "ExpectedEndDate", 
                    "StartDate", 
                    "ActualEndDate", 
                    "ExpectedRecruitment", 
                    "SUM(Recruitment) AS ActualRecruitment"
                ],
                where: [
                    Fusion.eql("CommercialStudy", "Commercial"),
                    Fusion.in("ActiveStatus", ["Closed - follow-up complete", "Closed - in follow-up"]),
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-4-1")),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.between("ActualEndDate", new Date("2011-4-1"), new Date("2012-4-1")),
                    Fusion.gt("ExpectedRecruitment", 0)
                ],
                groupBy: [
                    "PortfolioStudyID",
                    "MemberOrg",
                    "ExpectedEndDate", 
                    "StartDate", 
                    "ActualEndDate", 
                    "ExpectedRecruitment"
                ]
            })
            .onTable("recruitmentTable")
            .andReturnQueryResults();
        });
        
        it("should fetch closed noncommercial studies", function() {
            return expectOperation(Query, function(parent) {
                return parent.timeTargetStudyInfo({
                    open: false,
                    commercial: false,
                    financialYear: 2012
                });
            })
            .toMakeQuery({
                select: [
                    "PortfolioStudyID",
                    "MemberOrg",
                    "ExpectedEndDate", 
                    "StartDate", 
                    "ActualEndDate", 
                    "ExpectedRecruitment", 
                    "SUM(Recruitment) AS ActualRecruitment"
                ],
                where: [
                    Fusion.eql("CommercialStudy", "Non-Commercial"),
                    Fusion.in("ActiveStatus", ["Closed - follow-up complete", "Closed - in follow-up"]),
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-4-1")),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.between("ActualEndDate", new Date("2011-4-1"), new Date("2012-4-1")),
                    Fusion.gt("ExpectedRecruitment", 0)
                ],
                groupBy: [
                    "PortfolioStudyID",
                    "MemberOrg",
                    "ExpectedEndDate", 
                    "StartDate", 
                    "ActualEndDate", 
                    "ExpectedRecruitment"
                ]
            })
            .onTable("recruitmentTable")
            .andReturnQueryResults();
        });
    });
});
