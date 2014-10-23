var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;
var mock            = require("./mocks.js");

var Fusion          = require("../src/modules/fusion.js");
var Recruitment     = require("../src/modules/recruitment.js");

var _               = require("underscore");

describe("recruitment", function() {
    describe("weightedGraph", function() {
        it("should produce graph", function(){
            return expectOperation(Recruitment, function(parent) {
                return parent.weightedGraph([
                    {MemberOrg: ["Guy's"], CommercialStudy: ["Commercial"], MainSpecialty: ["Mental Health"], MainReportingDivision: ["Division 4"]}
                ]);
            })
            .toMakeQuery({
                select: ["SUM(Recruitment) AS MonthRecruitment", "Month", "Banding"]
            })
            .withStubbedResult([
                {MonthRecruitment: 2, Month: new Date("2011-3-31"), Banding: "Large"}
            ])
            .onTable("recruitmentTable")
            .andReturn([
                {
                    key: "Guy's: Mental Health, Division 4 (Commercial only)"
                }
            ]);
        });
    });
});
