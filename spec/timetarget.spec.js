var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;
var mock            = require("./mocks.js");

var TimeTarget      = require("../src/modules/timetarget.js");

var _               = require("underscore");

describe("timetarget", function() {
    describe("withTimeTargetInfo", function() {
        it("should return time & target information for open studies", function() {
            mock.currentDate = new Date("2011-1-6");
            
            expectOperation(TimeTarget, function(parent) {
                return parent.withTimeTargetInfo();
            })
            .withInput([
                {
                    ActiveStatus: "Open",
                    ExpectedEndDate: new Date("2011-1-3"),
                    StartDate: new Date("2011-1-4"),
                    ActualEndDate: '',
                    ExpectedRecruitment: 102,
                    ActualRecruitment: 104
                }
            ])
            .toReturn([
                {
                    ActiveStatus: "Open",
                    ExpectedEndDate: new Date("2011-1-3"),
                    StartDate: new Date("2011-1-4"),
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
        
        it("should return closed time/target information for studies with a closed activestatus", function() {
            mock.currentDate = new Date("2011-1-10");
            
            return expectOperation(TimeTarget, function(parent) {
                return parent.withTimeTargetInfo();
            })
            .withInput([
                {
                    ActiveStatus: "Closed - follow-up complete",
                    ExpectedEndDate: new Date("2011-1-6"),
                    StartDate: new Date("2011-1-4"),
                    ActualEndDate: new Date("2011-1-8"),
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                }
            ])
            .toReturn([
                {
                    ActiveStatus: "Closed - follow-up complete",
                    ExpectedEndDate: new Date("2011-1-6"),
                    StartDate: new Date("2011-1-4"),
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
        
        it("should return incomplete information for closed studies without a closed date", function() {
            mock.currentDate = new Date("2011-1-10");
            
            return expectOperation(TimeTarget, function(parent) {
                return parent.withTimeTargetInfo();
            })
            .withInput([
                {
                    ActiveStatus: "Closed - follow-up complete",
                    ExpectedEndDate: new Date("2011-1-6"),
                    StartDate: new Date("2011-1-4"),
                    ActualEndDate: "",
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                }
            ])
            .toReturn([
                {
                    ActiveStatus: "Closed - follow-up complete",
                    ExpectedEndDate: new Date("2011-1-6"),
                    StartDate: new Date("2011-1-4"),
                    ActualEndDate: "",
                    ExpectedRecruitment: 200,
                    ActualRecruitment: 100,
                    IncompleteInformation: true
                }
            ]);
        });
        
        it("should return incomplete time & target information for studies missing targets", function() {
            mock.currentDate = new Date("2011-1-10");
            
            return expectOperation(TimeTarget, function(parent) {
                return parent.withTimeTargetInfo();
            })
            .withInput([
                {
                    ActiveStatus: "Open",
                    ExpectedEndDate: "",
                    StartDate: "",
                    ActualEndDate: "",
                    ExpectedRecruitment: "",
                    ActualRecruitment: "",
                }
            ])
            .toReturn([
                {
                    ActiveStatus: "Open",
                    ExpectedEndDate: "",
                    StartDate: "",
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
            return expectOperation(TimeTarget, function(parent) {
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
            return expectOperation(TimeTarget, function(parent) {
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
            return expectOperation(TimeTarget, function(parent) {
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
        
        it("should record incomplete info", function() {
            return expectOperation(TimeTarget, function(parent) {
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
                    RAG: "IncompleteInformation"
                }
            ]);
        });
        
        it("should be red for closed study < 1.0", function() {
            return expectOperation(TimeTarget, function(parent) {
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
            return expectOperation(TimeTarget, function(parent) {
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
    
    describe("timeTargetGraph", function() {
        it("should produce graph data", function() {
            return expectOperation(TimeTarget, function(parent) {
                return parent.timeTargetGraph({
                    colors: {
                        Red: "r", Amber: "a", Green: "g", IncompleteInformation: "i"
                    }
                });
            })
            .withInput([
                {RAG: "Red", MemberOrg: "1", PortfolioStudyID: 1},
                {RAG: "Red", MemberOrg: "2", PortfolioStudyID: 1},
                {RAG: "Green", MemberOrg: "1", PortfolioStudyID: 1},
                {RAG: "Green", MemberOrg: "1", PortfolioStudyID: 2},
                {RAG: "Green", MemberOrg: "2", PortfolioStudyID: 1},
                {RAG: "Amber", MemberOrg: "1", PortfolioStudyID: 1},
                {RAG: "Amber", MemberOrg: "2", PortfolioStudyID: 1},
                {RAG: "Amber", MemberOrg: "2", PortfolioStudyID: 2},
                {RAG: "IncompleteInformation", MemberOrg: "2"}
            ])
            .toReturn([
                {
                    key: "1",
                    values: [
                        {key: "Red", values: [{key: "", color: "r", value: 1}]},
                        {key: "Amber", values: [{key: "", color: "a", value: 1}]},
                        {key: "Green", values: [{key: "", color: "g", value: 2}]},
                    ]
                },{
                    key: "2",
                    values: [
                        {key: "Red", values: [{key: "", color: "r", value: 1}]},
                        {key: "Amber", values: [{key: "", color: "a", value: 2}]},
                        {key: "Green", values: [{key: "", color: "g", value: 1}]},
                        {key: "Incomplete Information", values: [{key: "", color: "i", value: 1}]},
                    ]
                },
            ]);
        });
    });
});
