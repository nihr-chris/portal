var _           = require("underscore");

var util        = require("./util.js");
var Operation   = require("./operation.js");
var palette     = require("./palette.js");

module.exports = Operation.module({
    imports: [require("./graph.js"), require("./query.js")],
    operations: {
        weightedGraph: function(groupFilters) {
            util.checkArgs(arguments, Array.of({
                MemberOrg: Array.of(String),
                MainSpecialty: Array.of(String),
                MainReportingDivision: Array.of(String),
                CommercialStudy: Array.of(String)
            }));
            
            var groups = _.map(groupFilters, function(filter) {
                return this.fetchRecruitment({
                    filter: filter,
                    groupBy: ["Month", "Banding"]
                })
                .withFY({
                    FY: "Month"
                })
                .sum({
                    valuesFromField: "MonthRecruitment",
                    inField: "FYRecruitment"
                })
                .barGroup({
                    value: "FYRecruitment",
                    stackBy: "Banding",
                    seriesBy: "FY",
                    stackColors: palette.generate(["Interventional/Both", "Observational", "Large"])
                });
            });
            
            return _.first(groups).union(_.rest(groups));
        },
    }
});
