var _           = require("underscore");

var Operation   = require("./operation.js");
var util        = require("./util.js");
var Fusion      = require("./fusion.js");

module.exports = Operation.module({
    operations: {
        
        /** 
         * Fetch total monthly recruitment by study banding, filtering by
         * division, specialty, trust and commercial status. 
         * 
         *  Primarily useful for producing reports on weighted recruitment.
         */
         
        fetchRecruitment: function(params) {
            util.checkArgs(arguments, {
                filter: {'*': Array},
                groupBy: Array.of(String)
            });
            
            var filters = _.compact(_.map(params.filter, function(values, field) {
                return (values.length === 0) ? undefined : Fusion.in(field, values);
            }));
            
            var table = this.recruitmentTable;
            return this.childOperation({
                inputColumns: [],
                outputColumns: params.groupBy.concat(["MonthRecruitment"]),
                transform: function() {
                    return table.fetch({
                        select:  params.groupBy.concat(["SUM(Recruitment) AS MonthRecruitment"]),
                        where:   filters,
                        groupBy: params.groupBy
                    });
                }
            });
        },
        
        filterOptions: function(column) {
            util.checkArgs(arguments, String);
            
            var table = this.recruitmentTable;
            return this.childOperation({
                inputColumns: [],
                outputColumns: [],
                transform: function() {
                    return table.fetch({
                        select:  [column],
                        groupBy: [column]
                    });
                }
            })
            .format(function(rows) {
                return _.without(_.map(rows, column), 0);
            });
        },
        
        timeTargetStudyInfo: function(params) {
            util.checkArgs(arguments, {
                open: Boolean,
                commercial: Boolean,
                financialYear: Number,
            });
            
            var table = this.recruitmentTable;
            
            return this.childOperation({
                inputColumns: [],
                outputColumns: [
                    "PortfolioStudyID",
                    "MemberOrg",
                    "StartDate",
                    "ExpectedEndDate",
                    "ActualEndDate",
                    "ExpectedRecruitment",
                    "ActualRecruitment"
                ],
                transform: function(rows) {
                    var filters = [
                        Fusion.gte("PortfolioQualificationDate", new Date("2010-4-1")),
                        Fusion.eql("ProjectStatus", "Blue"),
                        Fusion.gt("ExpectedRecruitment", 0)
                    ];
                    
                    if (params.commercial) {
                        filters.push(Fusion.eql("CommercialStudy", "Commercial"));
                    } else {
                        filters.push(Fusion.eql("CommercialStudy", "Non-Commercial"));
                    }
                    
                    if (params.open) {
                        filters.push(Fusion.eql("ActiveStatus", "Open"));
                        filters.push(Fusion.gte("StartDate", new Date("2010-4-1")));
                        filters.push(Fusion.gte("Month", new Date(params.financialYear - 1, 3, 1)));
                    } else {
                        filters.push(Fusion.in("ActiveStatus", ["Closed - in follow-up", "Closed - follow-up complete"]));
                        filters.push(Fusion.between("ActualEndDate", new Date(params.financialYear - 1, 3, 1), new Date(params.financialYear, 3, 1)));
                    }
                    
                    return table.fetch({
                        select: [
                            "PortfolioStudyID",
                            "MemberOrg",
                            "StartDate",
                            "ExpectedEndDate",
                            "ActualEndDate",
                            "ExpectedRecruitment",
                            "SUM(Recruitment) AS ActualRecruitment"
                        ],
                        where: filters,
                        groupBy: [
                            "PortfolioStudyID",
                            "MemberOrg",
                            "StartDate",
                            "ExpectedEndDate",
                            "ActualEndDate",
                            "ExpectedRecruitment"
                        ]
                    });
                }
            });
        }
    }
});
