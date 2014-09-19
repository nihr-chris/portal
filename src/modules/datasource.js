var BiMap = require('bimap');
var Promise = require('promise');
var _ = require('underscore');

var Fusion = require("./fusion.js");
var util = require('./util.js');

/*
    This module contains all the logic for querying the database and
    processing the results.
    
    The querying and processing operations are broken down into small operations
    that can be combined to produce. This makes the individual operations easier
    to test and allows us to easily reuse code between different reports.
    
    Most of the logic in this module consists of methods on a DataSource object
    which return functions. The returnd functions are combined using
    DataSource.compose() to produce a complex operation that executes in the background
    and notifies us when it is done.
    
    Eg:
        var myDataSource = new DataSource(...);
        var getNonCommercialMonthlyRecruitment = DataSource.compose(
            myDataSource.getNonCommercialStudies(),
            myDataSource.monthlyRecruitment(startDate, endDate)
        );
        
    will combine the smaller operations into a larger operation that gets all 
    noncommercial studies, then for each study, fetches the monthly recruitment.
    
    To perform an operation, use DataSource.do()
    
    Eg:
    DataSource.do({
        operation: getNonCommercialMonthlyRecruitment, 
        onCompleted: function(recruitment) {
            console.log(studies);
        },
        onError: function(error) {
            console.log(error);
        },
        progress: function(progress) {
            console.log(progress + "% complete");
        }
    });
*/
    

var DataSource = function(params) {
    var data = new BiMap();
    var pendingOps = [];
    
    this.trustTable = params.trustTable;
    this.recruitmentTable = params.recruitmentTable;
    this.studyTable = params.studyTable;
    
    this.trustID = function(name) {
        var it = data.val(name);
        if (!it) throw new Error("Unknown trust: " + name);
        return it;
    };
    
    this.trustName = function(id) {
        var it = data.key(id);
        if (!it) throw new Error("Unknown trustID: " + id);
        return it;
    };
    
    this.waitForLoad = this.trustTable.fetch({
            select: ["MemberOrgID", "MemberOrg"]
        })
        .then(function(result) {
            _.each(result, function(row) {
                data.push(row.MemberOrgID, row.MemberOrg);
            });
        });
};


DataSource.prototype.getNonCommercialStudies = function() {
    var data = this;
    
    return function() {
        return data.studyTable.fetch({
            select: ["StudyID"],
            where: [Fusion.eql("Commercial", 0)]
        });
    };
};

DataSource.prototype.monthlyRecruitment = function(startDate, endDate, groupBy) {
    if (!groupBy) groupBy = [];
    var data = this;
    
    return function(studies) {
        var studyIDs = _.map(studies, "StudyID");
        
        return data.recruitmentTable
            .fetch({
                select: ["Month", "SUM(MonthRecruitment)"].concat(groupBy),
                where: [
                    Fusion.in("StudyID", studyIDs),
                    Fusion.between("Month", startDate, endDate)
                ],
                groupBy: ["Month"].concat(groupBy)
            });
    };
};

DataSource.prototype.runningTotal = function(totalField, sequenceField) {
    return function(inputRows) {
        var groupedRows = _.groupBy(inputRows, function(row) {
            var groupByMap = _.omit(row, totalField, sequenceField);
            return _.values(groupByMap);
        });
        
        var dateSortedGroupedRows = _.map(groupedRows, function(row) {
            return _.sortBy(row, sequenceField);
        });
        
        _.each(dateSortedGroupedRows, function(group) {
            var total = 0;
            var lastDate = null;
            
            _.each(group, function(row) {
                var thisDate = row[sequenceField];
                var changed = !lastDate || (thisDate < lastDate) || (thisDate > lastDate);
                
                if (changed) {
                    total = row[totalField] + total;
                } else {
                    total = row[totalField];
                }
                
                row[totalField] = total;
                lastDate = thisDate;
            });
        });
        
        var result = _.flatten(_.values(dateSortedGroupedRows), true);
        return Promise.resolve(result);
    };
};

module.exports = DataSource;
