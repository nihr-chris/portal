var BiMap = require('bimap');
var Promise = require('promise');
var _ = require('underscore');

var Fusion = require("./fusion.js");
var util = require('./util.js');

var ReportContext = function(trustTable, recTable, studyTable) {
    var data = new BiMap();
    var pendingOps = [];
    
    this._recTable = recTable;
    this._studyTable = studyTable;
    
    this.trustID = function(name) {
            console.log(JSON.stringify(data));
        var it = data.val(name);
        if (!it) throw new Error("Unknown trust: " + name);
        return it;
    };
    
    this.trustName = function(id) {
            console.log(JSON.stringify(data));
        var it = data.key(id);
        if (!it) throw new Error("Unknown trustID: " + id);
        return it;
    };
    
    var loadingOpID = util.uid();
    pendingOps.push(loadingOpID);
    
    this.waitForLoad = trustTable.fetch(["MemberOrgID", "MemberOrg"])
        .then(function(result) {
            _.each(result, function(row) {
                data.push(row.MemberOrgID, row.MemberOrg);
            });
            
            console.log(JSON.stringify(data));
            pendingOps.splice(pendingOps.indexOf(loadingOpID));
        });
};

ReportContext.testContext = function() {
    var trusts = Fusion.mock([
        [["MemberOrgID", "MemberOrg"], [
            {"MemberOrg": "Org1", "MemberOrgID": 1},
            {"MemberOrg": "Org2", "MemberOrgID": 2},
            {"MemberOrg": "Org3", "MemberOrgID": 3},
            {"MemberOrg": "Org4", "MemberOrgID": 4}
        ]]
    ]);
    
    return new ReportContext(trusts);
};

module.exports = ReportContext;
