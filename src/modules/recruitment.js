var _           = require("underscore");
var moment      = require("moment");

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
        },
        
        withTimeTargetInfo: function() {
            var currentDate = moment(this.currentDate);
            
            return this.childOperation({
                outputColumns: this.outputColumns.concat(["IncompleteInformation", "ExpectedDays", "ActualDays", "PercentProgress", "PercentTargetMet", "Open"]),
                inputColumns: ["StartDate", "ExpectedEndDate", "ActualEndDate", "ExpectedRecruitment", "ActualRecruitment"],
                transform: function(rows) {
                    return _.map(rows, function(input) {
                        var output = _.clone(input);
                        
                        var start = moment(input.StartDate);
                        var expEnd = moment(input.ExpectedEndDate);
                        var actEnd = moment(input.ActualEndDate);
                        
                        if (!start.isValid()
                            || !expEnd.isValid()
                            || !_.isNumber(input.ExpectedRecruitment)) {
                                
                            output.IncompleteInformation = true;
                            return output;
                        }
                        
                        if (input.ActiveStatus === "Open") {
                            output.ActualDays = currentDate.diff(start, "days");
                            output.Open = true;
                            
                        } else {
                            if (actEnd.isValid()) {
                                output.ActualDays = actEnd.diff(start, "days");
                                output.Open = false;
                                
                            } else {
                                output.IncompleteInformation = true;
                                return output;
                            }
                        }
                        
                        output.ExpectedDays = expEnd.diff(start, "days");
                        output.PercentProgress = output.Open ? (output.ActualDays / output.ExpectedDays) : 1.0;
                        output.PercentTargetMet = output.ActualRecruitment / output.ExpectedRecruitment;
                        output.IncompleteInformation = false;
                        
                        return output;
                    });
                }
            });
        },
        
        withTimeTargetRAG: function() {
            return this.childOperation({
                inputColumns: ["PercentTargetMet", "PercentProgress", "Open", "IncompleteInformation"],
                outputColumns: this.outputColumns.concat(["TimeTargetScore", "RAG"]),
                transform: function(rows) {
                    return _.map(rows, function(input) {
                        var output = _.clone(input);
                        
                        if (input.IncompleteInformation) {
                            output.RAG = "IncompleteInformation";
                            
                        } else if (input.Open) {
                            var score = input.PercentTargetMet / input.PercentProgress;
                            output.TimeTargetScore = score;
                            
                            if (score < 0.7) output.RAG = "Red";
                            else if (score < 1.0) output.RAG = "Amber";
                            else output.RAG = "Green";
                            
                        } else {
                            output.TimeTargetScore = input.PercentTargetMet;
                            
                            if (input.PercentTargetMet < 1.0) output.RAG = "Red";
                            else output.RAG = "Green";
                        }
                        
                        return output;
                    });
                }
            });
        },
        
        timeTargetGraph: function(params) {
            util.checkArgs(arguments, {
                colors: {Red: String, Amber: String, Green: String, IncompleteInformation: String}
            });
            
            return this.justFields(["RAG", "MemberOrg"]).count({
                valuesFromField: "RAG",
                inFields: {
                    Red: "RedStudies",
                    Amber: "AmberStudies",
                    Green: "GreenStudies",
                    IncompleteInformation: "IncompleteStudies"
                },
                groupBy: ["MemberOrg"]
            })
            .format(function(rows) {
                return _.map(rows, function(r) {
                    var ragBars = [];
                    
                    function addBar(label, color, value) {
                        ragBars.push({
                            key: label,
                            values: [
                                {color: color, value: value}
                            ]
                        });
                    }
                    
                    if (r.RedStudies > 0) addBar("Red", params.colors.Red, r.RedStudies);
                    if (r.AmberStudies > 0) addBar("Amber", params.colors.Amber, r.AmberStudies);
                    if (r.GreenStudies > 0) addBar("Green", params.colors.Green, r.GreenStudies);
                    if (r.IncompleteStudies > 0) addBar("Incomplete Information", params.colors.IncompleteInformation, r.IncompleteStudies);
                
                    return {
                        "key": r.MemberOrg,
                        values: ragBars
                    };
                });
            });
        }
    }
});
