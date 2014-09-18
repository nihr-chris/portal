var BiMap = require('bimap');
var Promise = require('promise');
var _ = require('underscore');

var Fusion = require("./fusion.js");
var util = require('./util.js');

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

module.exports = DataSource;
