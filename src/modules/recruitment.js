var _           = require("underscore");

var util        = require("./util.js");
var Operation   = require("./operation.js");
var Fusion      = require("./fusion.js");

module.exports = Operation.module({
    operations: {
    
        /** 
         * Fetch total monthly recruitment by study banding, also grouped by
         * division, specialty or trust. 
         * 
         *  Primarily useful for producing reports on weighted recruitment.
         */
         
        fetchBandedRecruitment: function(params) {
            util.checkArgs(arguments, {
                by: ["division", "specialty", "trust"],
                commercialStudies: [Boolean, null]
            });
              
            var mainGroupingColumn;
            switch (params.by) {
                case "division":    mainGroupingColumn = "MainReportingDivision"; break;
                case "specialty":   mainGroupingColumn = "MainSpecialty"; break;
                case "trust":       mainGroupingColumn = "MemberOrg"; break;
            }
            
            var groupBy = [mainGroupingColumn].concat([
                "Banding",
                "Month"
            ]);
            
            var filter = [];
            if (!_.isNull(params.commercialStudies) && !_.isUndefined(params.commercialStudies)) {
                filter.push(
                    params.commercialStudies 
                    ? Fusion.eql("CommercialStudy", "Commercial") 
                    : Fusion.eql("CommercialStudy", "Non-Commercial")
                );
            }
            
            var table = this.recruitmentTable;
            return this.childOperation({
                inputColumns: [],
                outputColumns: groupBy.concat(["MonthRecruitment"]),
                transform: function() {
                    return table.fetch({
                        select: groupBy.concat(["SUM(Recruitment) AS MonthRecruitment"]),
                        where: filter,
                        groupBy: groupBy
                    });
                }
            })
            .withFieldValues({
                Grouping: mainGroupingColumn
            })
            .justFields(["MonthRecruitment", "Banding", "Month", "Grouping"]);
        },
        
        
        /**
         * Transforms banded recruitment data into bar graph object.
         */
        performanceBarGraph: function(params) {
            util.checkArgs(arguments, {
                colors: {"Interventional/Both": String, Observational: String, Large: String, Merged: String},
                weighted: Boolean
            });
            
            return this.withFY({
                FY: "Month"
            })
            .justFields(["FY", "Grouping", "MonthRecruitment", "Banding"])
            .sum({
                valuesFromField: "MonthRecruitment",
                inField: "FYRecruitment",
                groupBy: ["Grouping", "FY", "Banding"]
            })
            .format(function(rows) {
                // UNCLEAN!!! UNCLEAN!!!
                // [todo] - tidy it up.
                
                
                return _.map(_.groupBy(rows, "Grouping"), function(rows, grouping) {
                    return {
                        key: grouping,
                        values: _.map(_.groupBy(rows, "FY"), function(rows, fy) {
                            if (params.weighted) {
                                return {
                                    key: fy,
                                    values: _.map(_.groupBy(rows, "Banding"), function(rows, banding) {
                                        if (rows.length !== 1) {
                                            throw new Error("Multiple rows returned for banding/fy/grouping");
                                        }
                                        
                                        var row = rows[0];
                                        return {
                                            color: params.colors[banding], 
                                            value: row.FYRecruitment
                                        };
                                    })
                                };
                            } else {
                                return {
                                    key: fy, 
                                    values: [
                                        {
                                            color: params.colors.Merged,
                                            value: _.reduce(rows, function(memo, row) {
                                                return memo + row.FYRecruitment;
                                            }, 0)
                                        }
                                    ]
                                };
                            }
                        })
                    };
                });
            });
        },
    }
});
