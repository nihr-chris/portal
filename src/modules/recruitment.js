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
                case "trust":       mainGroupingColumn = "TrustGroupName"; break;
            }
            
            var groupBy = [mainGroupingColumn].concat([
                "Banding",
                "MonthEndDate"
            ]);
            
            var filter = [];
            if (!_.isNull(params.commercialStudies) && !_.isUndefined(params.commercialStudies)) {
                filter.push(params.commercialStudies ? Fusion.eql("Commercial", 1) : Fusion.eql("Commercial", 0));
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
            .justFields(["MonthRecruitment", "Banding", "MonthEndDate", "Grouping"]);
        },
        
        
        /**
         * Transforms banded recruitment data into bar graph object.
         */
        performanceBarGraph: function(params) {
            util.checkArgs(arguments, {
                colors: Array.of({Interventional: String, Observational: String, Large: String, Merged: String}),
                weighted: Boolean
            });
            
            return this.withFY({
                FY: "MonthEndDate"
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
                
                var colorAllocations = {};
                var unusedColors = _.clone(params.colors);
                function getColor(horizontalGroup, verticalGroup) {
                    var colors = colorAllocations[horizontalGroup];
                    var defaultColor = {
                        Interventional: "steelblue", 
                        Observational: "steelblue", 
                        Large: "steelblue", 
                        Merged: "steelblue"
                    };
                    
                    if (!colors) {
                        colors = unusedColors.pop() || defaultColor;
                        colorAllocations[horizontalGroup] = colors;
                    }
                    
                    var color = colors[verticalGroup];
                    if (!color) {
                        throw new Error(
                            "No color defined for banding " + verticalGroup + "\n"
                            + "Defined bandings are: " + JSON.stringify(_.keys(colors))
                        );
                    }
                    return color;
                }
                
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
                                            color: getColor(fy, banding), 
                                            value: row.FYRecruitment
                                        };
                                    })
                                };
                            } else {
                                return {
                                    key: fy, 
                                    values: [
                                        {
                                            color: getColor(fy, "Merged"),
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
