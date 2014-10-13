var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;
var mock            = require("./mocks.js");

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
    
    describe("withTimeTargetInfo", function() {
        it("should return time & target information for open studies", function() {
            mock.currentDate = new Date("2011-1-6");
            
            expectOperation(Recruitment, function(parent) {
                return parent.timeTargetInfo();
            })
            .withInput([
                {
                    ExpectedStartDate: new Date("2011-1-2"),
                    ExpectedEndDate: new Date("2011-1-3"),
                    ActualStartDate: new Date("2011-1-4"),
                    ActualEndDate: '',
                    ExpectedRecruitment: 102,
                    ActualRecruitment: 104
                }
            ])
            .toReturn([
                {
                    ExpectedStartDate: new Date("2011-1-2"),
                    ExpectedEndDate: new Date("2011-1-3"),
                    ActualStartDate: new Date("2011-1-4"),
                    ActualEndDate: '',
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                    PercentTargetMet: 0.5,
                    ExpectedDays: 1,
                    ActualDays: 2,
                    PercentProgress: 2,
                    Open: true
                }
            ]);
        });
        
        it("should return closed time/target information for studies with a closed date in the past", function() {
            mock.currentDate = new Date("2011-1-10");
            
            return expectOperation(Recruitment, function(parent) {
                return parent.timeTargetInfo();
            })
            .withInput([
                {
                    ExpectedStartDate: new Date("2011-1-2"),
                    ExpectedEndDate: new Date("2011-1-4"),
                    ActualStartDate: new Date("2011-1-4"),
                    ActualEndDate: new Date("2011-1-8"),
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                }
            ])
            .toReturn([
                {
                    ExpectedStartDate: new Date("2011-1-2"),
                    ExpectedEndDate: new Date("2011-1-4"),
                    ActualStartDate: new Date("2011-1-4"),
                    ActualEndDate: new Date("2011-1-8"),
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                    PercentTargetMet: 0.5,
                    ExpectedDays: 2,
                    ActualDays: 4,
                    PercentProgress: 1,
                    Open: false,
                    IncompleteInformation: false
                }
            ]);
        });
        
        it("should return open time & target information for studies without a closed date", function() {
            mock.currentDate = new Date("2011-1-10");
            
            return expectOperation(Recruitment, function(parent) {
                return parent.timeTargetInfo();
            })
            .withInput([
                {
                    ExpectedStartDate: new Date("2011-1-2"),
                    ExpectedEndDate: new Date("2011-1-4"),
                    ActualStartDate: new Date("2011-1-4"),
                    ActualEndDate: "",
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                }
            ])
            .toReturn([
                {
                    ExpectedStartDate: new Date("2011-1-2"),
                    ExpectedEndDate: new Date("2011-1-4"),
                    ActualStartDate: new Date("2011-1-4"),
                    ActualEndDate: "",
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                    PercentTargetMet: 0.5,
                    ExpectedDays: 2,
                    ActualDays: 6,
                    PercentProgress: 3,
                    Open: true,
                    IncompleteInformation: false
                }
            ]);
        });
        
        it("should return incomplete time & target information for studies missing targets", function() {
            mock.currentDate = new Date("2011-1-10");
            
            return expectOperation(Recruitment, function(parent) {
                return parent.timeTargetInfo();
            })
            .withInput([
                {
                    ExpectedStartDate: "",
                    ExpectedEndDate: "",
                    ActualStartDate: "",
                    ActualEndDate: "",
                    ExpectedRecruitment: "",
                    ActualRecruitment: "",
                }
            ])
            .toReturn([
                {
                    ExpectedStartDate: "",
                    ExpectedEndDate: "",
                    ActualStartDate: "",
                    ActualEndDate: "",
                    ExpectedRecruitment: "",
                    ActualRecruitment: "",
                    IncompleteInformation: true
                }
            ]);
        });
    });
    
    describe("withTimeTargetRAG", function() {
        it("should be red for open study < 0.7", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.withTimeTargetRAG();
            })
            .withInput([
                {
                    PercentTargetMet: 0.25,
                    PercentProgress: 0.5,
                    Open: true,
                    IncompleteInformation: false,
                }
            ])
            .toReturn([
                {
                    PercentTargetMet: 0.25,
                    PercentProgress: 0.5,
                    Open: true,
                    IncompleteInformation: false,
                    TimeTargetScore: 0.5,
                    RAG: "Red"
                }
            ]);
        });
        
        it("should be amber for open study >= 0.7 and < 1.0", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.withTimeTargetRAG();
            })
            .withInput([
                {
                    PercentTargetMet: 0.35,
                    PercentProgress: 0.5,
                    Open: true,
                    IncompleteInformation: false,
                }
            ])
            .toReturn([
                {
                    PercentTargetMet: 0.35,
                    PercentProgress: 0.5,
                    Open: true,
                    IncompleteInformation: false,
                    TimeTargetScore: 0.7,
                    RAG: "Amber"
                }
            ]);
        });
        
        it("should be green for open study >= 1.0", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.withTimeTargetRAG();
            })
            .withInput([
                {
                    PercentTargetMet: 0.5,
                    PercentProgress: 0.5,
                    Open: true,
                    IncompleteInformation: false,
                }
            ])
            .toReturn([
                {
                    PercentTargetMet: 0.5,
                    PercentProgress: 0.5,
                    Open: true,
                    IncompleteInformation: false,
                    TimeTargetScore: 1.0,
                    RAG: "Green"
                }
            ]);
        });
        
        it("should pass through incomplete info", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.withTimeTargetRAG();
            })
            .withInput([
                {
                    PercentTargetMet: 1.0,
                    PercentProgress: 1,
                    Open: false,
                    IncompleteInformation: true,
                }
            ])
            .toReturn([
                {
                    PercentTargetMet: 1.0,
                    PercentProgress: 1,
                    Open: false,
                    IncompleteInformation: true,
                }
            ]);
        });
        
        it("should be red for closed study < 1.0", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.withTimeTargetRAG();
            })
            .withInput([
                {
                    PercentTargetMet: 0.9,
                    PercentProgress: 1,
                    Open: false,
                    IncompleteInformation: false
                }
            ])
            .toReturn([
                {
                    PercentTargetMet: 0.9,
                    PercentProgress: 1,
                    Open: false,
                    IncompleteInformation: false,
                    TimeTargetScore: 0.9,
                    RAG: "Red"
                }
            ]);
        });
        
        it("should be green for closed study >= 1.0", function() {
            return expectOperation(Recruitment, function(parent) {
                return parent.withTimeTargetRAG();
            })
            .withInput([
                {
                    PercentTargetMet: 1.0,
                    PercentProgress: 1,
                    Open: false,
                    IncompleteInformation: false
                }
            ])
            .toReturn([
                {
                    PercentTargetMet: 1.0,
                    PercentProgress: 1,
                    Open: false,
                    IncompleteInformation: false,
                    TimeTargetScore: 1,
                    RAG: "Green"
                }
            ]);
        });
    });
});
