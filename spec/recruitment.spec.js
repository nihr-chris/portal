var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;
var expectOperation = require("./operation.helpers.js").expectOperation;

var Fusion          = require("../src/modules/fusion.js");
var Recruitment     = require("../src/modules/recruitment.js");

var _               = require("underscore");

describe("recruitment", function() {
    describe("fetchRecruitment", function() {
        it("should query by division", function() {
            return expectOperation(Recruitment, function(parent){
                return parent.fetchBandedRecruitment({
                    by: "division"
                });
                
            }).toMakeQuery({
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
            .onTable("recruitmentTable")
            .andReturnQueryResults();
        });
    });
});
