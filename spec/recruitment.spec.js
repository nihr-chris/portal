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
                    "Month",
                    "Banding",
                    "MainReportingDivision"
                ],
                groupBy: [
                    "Month",
                    "Banding",
                    "MainReportingDivision"
                ]
            })
            .withStubbedResult([
                {MonthRecruitment: 1, Month: "1/1/01", Banding: "Interventional/Both", MainReportingDivision: "Division 1"}
            ])
            .onTable("recruitmentTable")
            .andReturn([
                {MonthRecruitment: 1, Month: "1/1/01", Banding: "Interventional/Both", Grouping: "Division 1"}
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
                    "Month",
                    "Banding",
                    "MainReportingDivision"
                ],
                where: [
                    Fusion.eql("CommercialStudy", "Non-Commercial")
                ],
                groupBy: [
                    "Month",
                    "Banding",
                    "MainReportingDivision"
                ]
            })
            .withStubbedResult([
                {MonthRecruitment: 1, Month: "1/1/01", Banding: "Interventional/Both", MainReportingDivision: "Division 1"}
            ])
            .onTable("recruitmentTable")
            .andReturn([
                {MonthRecruitment: 1, Month: "1/1/01", Banding: "Interventional/Both", Grouping: "Division 1"}
            ]);
        });
    });
    
    describe("performanceBarGraph", function(){
        var colors = {
            "Interventional/Both": "color-Int", 
            Observational: "color-Obs", 
            Large: "color-Large", 
            Merged: "color-Merged"
        };
        
        var sampleInput = [
            {MonthRecruitment: 1, Month: new Date("2001-1-1"), Banding: "Interventional/Both", Grouping: "Division 1"},
            {MonthRecruitment: 2, Month: new Date("2001-2-1"), Banding: "Interventional/Both", Grouping: "Division 1"},
            {MonthRecruitment: 3, Month: new Date("2001-1-1"), Banding: "Observational", Grouping: "Division 1"},
            {MonthRecruitment: 4, Month: new Date("2001-1-1"), Banding: "Large", Grouping: "Division 1"},
            {MonthRecruitment: 5, Month: new Date("2001-4-1"), Banding: "Observational", Grouping: "Division 1"},
            {MonthRecruitment: 6, Month: new Date("2001-4-1"), Banding: "Observational", Grouping: "Division 2"}
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
                                {color: "color-Int", value: 3},
                                {color: "color-Obs", value: 3},
                                {color: "color-Large", value: 4}
                            ]
                        }, {
                            key: "2001",
                            values: [
                                {color: "color-Obs", value: 5},
                            ]
                        }
                    ]
                }, {
                    key: "Division 2",
                    values: [
                        {
                            key: "2001",
                            values: [
                                {color: "color-Obs", value: 6},
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
                                {color: "color-Merged", value: 10}
                            ]
                        }, {
                            key: "2001",
                            values: [
                                {color: "color-Merged", value: 5},
                            ]
                        }
                    ]
                }, {
                    key: "Division 2",
                    values: [
                        {
                            key: "2001",
                            values: [
                                {color: "color-Merged", value: 6},
                            ]
                        }
                    ]
                }
            ]);
        });
    });
});
