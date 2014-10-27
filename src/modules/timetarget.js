var _           = require("underscore");
var moment      = require("moment");

var Operation   = require("./operation.js");
var util        = require("./util.js");

module.exports = Operation.module({
    imports: [require("./query.js")],
    operations: {
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
                    
                    function addBar(label, value) {
                        ragBars.push({
                            key: label,
                            values: [
                                {key: label, value: value}
                            ]
                        });
                    }
                    
                    if (r.RedStudies > 0) addBar("Red", r.RedStudies);
                    if (r.AmberStudies > 0) addBar("Amber", r.AmberStudies);
                    if (r.GreenStudies > 0) addBar("Green", r.GreenStudies);
                    if (r.IncompleteStudies > 0) addBar("Incomplete Information", r.IncompleteStudies);
                
                    return {
                        "key": r.MemberOrg,
                        values: ragBars
                    };
                });
            });
        }
    }
});
