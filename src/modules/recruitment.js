var _           = require("underscore");

var util        = require("./util.js");
var Operation   = require("./operation.js");

module.exports = Operation.module({
    imports: [require("./graph.js"), require("./query.js")],
    operations: {
        yearRecruitmentGraph: function(params) {
            util.checkArgs(arguments, {
                filters: Array.of({
                    MemberOrg: Array.of(String),
                    MainSpecialty: Array.of(String),
                    MainReportingDivision: Array.of(String),
                    CommercialStudy: Array.of(String)
                }),
                financialYears: Array.of(String),
                weighted: Boolean
            });
            
            var operation = this;
            var groups = _.map(params.filters, function(filter) {
                return operation.fetchRecruitment({
                    filter: filter,
                    groupBy: ["Month", "Banding"]
                })
                .withFY({
                    FY: "Month"
                })
                .filterValues({
                    column: "FY",
                    values: params.financialYears
                })
                .justFields(["FY", "Banding", "MonthRecruitment"])
                .sum({
                    valuesFromField: "MonthRecruitment",
                    inField: "FYRecruitment",
                    groupBy: ["FY", "Banding"]
                })
                .weight({
                    field: "FYRecruitment",
                    byFactors: {
                        "Interventional/Both": params.weighted ? 14 : 1,
                        "Observational": params.weighted ? 3 : 1,
                        "Large": 1,
                    },
                    onField: "Banding"
                })
                .withFilterDescription(filter)
                .barChart({
                    valueFrom: "FYRecruitment",
                    groupBy: "Filter",
                    stackBy: params.weighted ? "Banding" : undefined,
                    seriesBy: "FY"
                });
            });
            
            if (groups.length === 0) return this.empty();
            else return _.first(groups).union(_.rest(groups));
        },
        
        
        withFilterDescription: function(filter) {
            util.checkArgs(arguments, {
                MemberOrg: Array.of(String),
                CommercialStudy: Array.of(String),
                MainSpecialty: Array.of(String),
                MainReportingDivision: Array.of(String)
            });
            
            function memberOrgDec() {
                if (filter.MemberOrg.length > 0) {
                    return filter.MemberOrg.join(" & ");
                } else {
                    return "CRN-Wide";
                }
            }
            
            function specialtyDivisionDesc() {
                var desc = [];
                
                if (filter.MainSpecialty.length > 0) {
                    desc.push(filter.MainSpecialty.join(" & "));
                }
                if (filter.MainReportingDivision.length > 0) {
                    desc.push(filter.MainReportingDivision.join(" & "));
                }
                
                return (desc.length === 0) ? null : desc.join(", ");
            }
            
            function commercialDesc() {
                if (filter.CommercialStudy.length === 1) {
                    return "(" + filter.CommercialStudy[0] + ")";
                } else {
                    return null;
                }
            }
            
            var afterColon = _.compact([specialtyDivisionDesc(), commercialDesc()]);
            var filterDesc;
            if (afterColon.length > 0) {
                filterDesc = memberOrgDec() + ": " + afterColon.join(" ");
            } else {
                filterDesc = memberOrgDec();
            }
            
            return this.childOperation({
                inputColumns: [],
                outputColumns: this.outputColumns.concat(["Filter"]),
                
                transform: function(rows) {
                    return _.map(rows, function(r) {
                        var next = _.clone(r);
                        next.Filter = filterDesc;
                        return next;
                    });
                }
            });
        }
    }
});
