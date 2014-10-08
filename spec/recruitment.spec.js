var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;

var Fusion          = require("../src/modules/fusion.js");
var Recruitment     = require("../src/modules/recruitment.js");

var _               = require("underscore");

describe("recruitment", function() {
    describe("fetchRecruitment", function() {
        it("should query by group", function() {
            return expectOperation(Recruitment, function(parent){
                return parent.fetchBandedRecruitment({
                    by: "division"
                });
            })
            .toMakeQuery({
                select: [
                    "SUM(Recruitment) AS MonthRecruitment",
                    "MonthEndDate",
                    "Banding",
                    "MainReportingDivision"
                ],
                groupBy: [
                    "MonthEndDate",
                    "Banding",
                    "MainReportingDivision"
                ]
            })
            .withStubbedResult([
                {MonthRecruitment: 1, MonthEndDate: "1/1/01", Banding: "Interventional", MainReportingDivision: "Division 1"}
            ])
            .onTable("recruitmentTable")
            .andReturn([
                {MonthRecruitment: 1, MonthEndDate: "1/1/01", Banding: "Interventional", Grouping: "Division 1"}
            ]);
        });
        
        it("should restrict to commercial/noncommercial studies", function() {
            return expectOperation(Recruitment, function(parent){
                return parent.fetchBandedRecruitment({
                    by: "division",
                    commercialStudies: false
                });
            })
            .toMakeQuery({
                select: [
                    "SUM(Recruitment) AS MonthRecruitment",
                    "MonthEndDate",
                    "Banding",
                    "MainReportingDivision"
                ],
                where: [
                    Fusion.eql("Commercial", 0)
                ],
                groupBy: [
                    "MonthEndDate",
                    "Banding",
                    "MainReportingDivision"
                ]
            })
            .withStubbedResult([
                {MonthRecruitment: 1, MonthEndDate: "1/1/01", Banding: "Interventional", MainReportingDivision: "Division 1"}
            ])
            .onTable("recruitmentTable")
            .andReturn([
                {MonthRecruitment: 1, MonthEndDate: "1/1/01", Banding: "Interventional", Grouping: "Division 1"}
            ]);
        });
    });
});
