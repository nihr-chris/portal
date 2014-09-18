var BiMap = require('bimap');
var Promise = require('promise');
var _ = require('underscore');

var Fusion = require("./fusion.js");
var util = require('./util.js');

var DataSource = function(trustTable, recTable, studyTable) {
    var data = new BiMap();
    var pendingOps = [];
    
    this.trustTable = trustTable;
    this.recruitmentTable = recTable;
    this.studyTable = studyTable;
    
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
    
    var loadingOpID = util.uid();
    pendingOps.push(loadingOpID);
    
    this.waitForLoad = trustTable.fetch({
            select: ["MemberOrgID", "MemberOrg"]
        })
        .then(function(result) {
            _.each(result, function(row) {
                data.push(row.MemberOrgID, row.MemberOrg);
            });
            
            pendingOps.splice(pendingOps.indexOf(loadingOpID));
        });
};


DataSource.prototype.getNonCommercialStudies = function() {
    return this.studyTable.fetch(
        ["StudyID"],
        [Fusion.eql("Commercial", 0)]
    );
};

DataSource.prototype.studyMonthlyRecruitment = function() {
    var ctx = this.ctx;
    
    return function(studies) {
        var studyIDs = _.map(studies, "StudyID");
        
        return ctx.studyTable
            .fetch(
                ["Month", "TrustID", "StudyID", "MonthRecruitment"],
                [
                    Fusion.in("StudyID", studyIDs),
                    Fusion.between("Month", ctx.startDate, ctx.endDate)
                ]
            )
            .then(function(recruitmentCount) {
                var monthlyRecruitment = {};
                
                function studyInfo(id) {
                    if (!monthlyRecruitment[id]) monthlyRecruitment[id] = {};
                    return monthlyRecruitment[id];
                }
                
                recruitmentCount.each(function(row) {
                    studyInfo(row.StudyID)[row.Month] = row.MonthRecruitment;
                });
                
                return {
                    recruitment: monthlyRecruitment,
                    studies: studies
                };
            });
    }
};

module.exports = DataSource;
