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
    
    describe("performanceBarGraph", function(){
        var colors = [
            {Interventional: "color2001-Int", Observational: "color2001-Obs", Large: "color2001-Large", Merged: "color2001-Merged"},
            {Interventional: "color2000-Int", Observational: "color2000-Obs", Large: "color2000-Large", Merged: "color2000-Merged"}
        ];
        
        var sampleInput = [
            {MonthRecruitment: 1, MonthEndDate: new Date("2001-1-1"), Banding: "Interventional", Grouping: "Division 1"},
            {MonthRecruitment: 2, MonthEndDate: new Date("2001-2-1"), Banding: "Interventional", Grouping: "Division 1"},
            {MonthRecruitment: 3, MonthEndDate: new Date("2001-1-1"), Banding: "Observational", Grouping: "Division 1"},
            {MonthRecruitment: 4, MonthEndDate: new Date("2001-1-1"), Banding: "Large", Grouping: "Division 1"},
            {MonthRecruitment: 5, MonthEndDate: new Date("2001-4-1"), Banding: "Observational", Grouping: "Division 1"},
            {MonthRecruitment: 6, MonthEndDate: new Date("2001-4-1"), Banding: "Observational", Grouping: "Division 2"}
        ];
        
        it("should produce weighted bar chart", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.performanceBarGraph({
                    colors: colors,
                    weighted: true
                });
            })
            .withInput(sampleInput)
            .toReturn([
                {
                    key: "Division 1",
                    values: [
                        {
                            key: "2000",
                            values: [
                                {color: "color2000-Int", value: 3},
                                {color: "color2000-Obs", value: 3},
                                {color: "color2000-Large", value: 4}
                            ]
                        }, {
                            key: "2001",
                            values: [
                                {color: "color2001-Obs", value: 5},
                            ]
                        }
                    ]
                }, {
                    key: "Division 2",
                    values: [
                        {
                            key: "2001",
                            values: [
                                {color: "color2001-Obs", value: 6},
                            ]
                        }
                    ]
                }
            ]);
        });
        
        it("should produce unweighted bar chart", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.performanceBarGraph({
                    colors: colors,
                    weighted: false
                });
            })
            .withInput(sampleInput)
            .toReturn([
                {
                    key: "Division 1",
                    values: [
                        {
                            key: "2000",
                            values: [
                                {color: "color2000-Merged", value: 10}
                            ]
                        }, {
                            key: "2001",
                            values: [
                                {color: "color2001-Merged", value: 5},
                            ]
                        }
                    ]
                }, {
                    key: "Division 2",
                    values: [
                        {
                            key: "2001",
                            values: [
                                {color: "color2001-Merged", value: 6},
                            ]
                        }
                    ]
                }
            ]);
        });
    });
});
