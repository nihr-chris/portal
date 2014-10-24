var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;
var mock            = require("./mocks.js");

var Fusion          = require("../src/modules/fusion.js");
var Recruitment     = require("../src/modules/recruitment.js");

var _               = require("underscore");

describe("recruitment", function() {
    describe("weightedGraph", function() {
        it("should produce graph in date range", function(){
            return expectOperation(Recruitment, function(parent) {
                return parent.weightedGraph({
                    filters: [
                        {MemberOrg: ["Guy's"], CommercialStudy: ["Commercial"], MainSpecialty: ["Mental Health"], MainReportingDivision: ["Division 4"]}
                    ],
                    financialYears: ["2010-11"]
                });
            })
            .toMakeQuery({
                select: ["SUM(Recruitment) AS MonthRecruitment", "Month", "Banding"],
                where: [
                    Fusion.in("MemberOrg", ["Guy's"]),
                    Fusion.in("CommercialStudy", ["Commercial"]),
                    Fusion.in("MainSpecialty", ["Mental Health"]),
                    Fusion.in("MainReportingDivision", ["Division 4"])
                ],
                groupBy: ["Month", "Banding"]
            })
            .withStubbedResult([
                {MonthRecruitment: 2, Month: new Date("2011-3-31"), Banding: "Large"},
                {MonthRecruitment: 2, Month: new Date("2001-3-31"), Banding: "Large"},
            ])
            .onTable("recruitmentTable")
            .andReturn([
                {
                    key: "Guy's: Mental Health, Division 4 (Commercial)",
                    values: [
                        {
                            key: "2010-11",
                            values: [
                                {key: "Large", value: 2}
                            ]
                        }
                    ]
                }
            ]);
        });
    });
    
    
    describe("withFilterDescription", function() {
        it("should produce description of filter with all filter options specified", function(){
            return expectOperation(Recruitment, function(parent) {
                return parent.withFilterDescription({
                    MemberOrg: ["Guy's"], 
                    CommercialStudy: ["Commercial"], 
                    MainSpecialty: ["Mental Health"], 
                    MainReportingDivision: ["Division 4"]
                });
            })
            .withInput([
                {field: "blub"}
            ])
            .toReturn([
                {
                    field: "blub",
                    Filter: "Guy's: Mental Health, Division 4 (Commercial)"
                }
            ]);
        });
        
        it("should produce description of filter with all trusts", function(){
            return expectOperation(Recruitment, function(parent) {
                return parent.withFilterDescription({
                    MemberOrg: [], 
                    CommercialStudy: ["Commercial"], 
                    MainSpecialty: ["Mental Health"], 
                    MainReportingDivision: ["Division 4"]
                });
            })
            .withInput([
                {field: "blub"}
            ])
            .toReturn([
                {
                    field: "blub",
                    Filter: "CRN-Wide: Mental Health, Division 4 (Commercial)"
                }
            ]);
        });
        
        it("should produce description of filter with all divisions", function(){
            return expectOperation(Recruitment, function(parent) {
                return parent.withFilterDescription({
                    MemberOrg: ["Guy's"], 
                    CommercialStudy: ["Commercial"], 
                    MainSpecialty: ["Mental Health"], 
                    MainReportingDivision: []
                });
            })
            .withInput([
                {field: "blub"}
            ])
            .toReturn([
                {
                    field: "blub",
                    Filter: "Guy's: Mental Health (Commercial)"
                }
            ]);
        });
        
        it("should produce description of empty filter", function(){
            return expectOperation(Recruitment, function(parent) {
                return parent.withFilterDescription({
                    MemberOrg: [], 
                    CommercialStudy: [], 
                    MainSpecialty: [], 
                    MainReportingDivision: []
                });
            })
            .withInput([
                {field: "blub"}
            ])
            .toReturn([
                {
                    field: "blub",
                    Filter: "CRN-Wide"
                }
            ]);
        });
        
        it("should produce description of filter with multiple values", function(){
            return expectOperation(Recruitment, function(parent) {
                return parent.withFilterDescription({
                    MemberOrg: ["Guy's", "King's"], 
                    CommercialStudy: ["Commercial"],
                    MainSpecialty: ["Mental Health", "Cancer"], 
                    MainReportingDivision: ["Division 4", "Division 5"]
                });
            })
            .withInput([
                {field: "blub"}
            ])
            .toReturn([
                {
                    field: "blub",
                    Filter: "Guy's & King's: Mental Health & Cancer, Division 4 & Division 5 (Commercial)"
                }
            ]);
        });
    });
});
