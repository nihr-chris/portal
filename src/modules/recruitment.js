var _           = require("underscore");

var util        = require("./util.js");
var Operation   = require("./operation.js");
var Fusion      = require("./fusion.js");

module.exports = Operation.module({
    operations: {
    
        /** Fetch total monthly recruitment by study banding, also grouped by
         *  by division, specialty or trust. 
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
            
            var dataSource = this.dataSource;
            return this.childOperation({
                inputColumns: [],
                outputColumns: groupBy.concat(["MonthRecruitment"]),
                transform: function() {
                        return dataSource.recruitmentTable.fetch({
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
        
        recruitmentPerformanceData: function(weighted) {
            return this.withFY({
                FY: "MonthEndDate"
                
            }).sum({
                valuesFromField: "MonthRecruitment",
                inField: "YearRecruitment",
                groupBy: ["FY"]
                
            });
        },
        
        performanceBarGraph: function(params) {
            util.checkArgs(params, {
                colors: [Array.of(String), null]
            });
            
            var colorAllocations = {};
            var unusedColors = _.clone(params.colors);
            function getColor(key) {
                if (colorAllocations[key]) return colorAllocations[key];
                
                var color = unusedColors.pop() || "steelblue";
                colorAllocations[key] = color;
                return color;
            }
            
            return this.format(function(rows) {
                return _.map(_.groupBy(rows, "Grouping"), function(rows, grouping) {
                    return _.map(_.groupBy(rows, "FY"), function(rows, fy) {
                        return {
                            key: fy,
                            values: [
                                {color: getColor(fy), value: _.first(rows)}
                            ]
                        };
                    });
                });
            });
        },
    }
});
