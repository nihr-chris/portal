var _           = require("underscore");

var util        = require("./util.js");
var Operation   = require("./operation.js");
var Fusion      = require("./fusion.js");

module.exports = Operation.module({
    operations: {
    
        /** Fetch total monthly recruitment plus weighting information,
         *  by division, specialty or trust. */
         
        fetchRecruitment: function(params) {
            util.checkArgs(arguments, {
                by: ["division", "specialty", "trust"],
                commercialStudies: [Boolean, null]
            });
            
            var filter = [];
            if (!_.isNull(params.commercialStudies) && !_.isUndefined(params.commercialStudies)) {
                filter.push(params.commercialStudies ? Fusion.eql("Commercial", 1) : Fusion.eql("Commercial", 0));
            }
            
            var groupColumn;
            switch (params.by) {
                case "division":    groupColumn = "MainReportingDivision"; break;
                case "specialty":   groupColumn = "MainSpecialty"; break;
                case "trust":       groupColumn = "TrustGroupName"; break;
            }
            
            var relevantColumns = [
                "Banding",
                "MonthEndDate",
                "TrustGroupName",
                "Commercial",
                "FullTitle",
                "MainSpecialty",
                "MainReportingDivision"
            ];
            
            var unaggregatedColumns = _.without(relevantColumns, groupColumn);
            
            return this.query({
                    select: unaggregatedColumns.concat(["SUM(Recruitment) AS MonthRecruitment"]),
                    where: filter,
                    from: this.recruitmentPerformanceViewID,
                    groupBy: unaggregatedColumns
                })
                .withFieldValues({
                    "Grouping": groupColumn
                })
                ;
        },
        
        performanceDataYY: function(weighted) {
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
