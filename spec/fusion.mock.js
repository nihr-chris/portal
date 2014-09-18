var Promise = require('promise');
var _ = require('underscore');

var Fusion = require("../src/modules/fusion.js");
    
var fusionMock = function() {
    var queryKey= function(query) {
        if (!query.select) query.select = [];
        if (!query.where) query.where = [];
        if (!query.groupBy) query.groupBy = [];
        
        return JSON.stringify(
            [query.select.sort(), query.where.sort(), query.groupBy.sort()]
        );
    };
    
    var stubMap = {};

    return {
        stub: function(query) {
            var key = queryKey(query);
            stubMap[key] = query.values;
        },
        
        fetch: function(query) {
            var key = queryKey(query);
            
            if (stubMap[key]) {
                return Promise.resolve(stubMap[key]);
                
            } else {
                throw new Error(
                    "Unstubbed query invoked on mock Fusion Table.\n"
                    + "Query was: " + key + "\n"
                    + "Stubbed queries are: " + _.keys(stubMap).join(";\n")
                );
            }
        }
    };
};

fusionMock.exampleOrgs = function() {
    var table = fusionMock();
    table.stub({
        select: ["MemberOrg", "MemberOrgID"],
        values: [
            {"MemberOrgID": 1, "MemberOrg": "Org1"},
            {"MemberOrgID": 2, "MemberOrg": "Org2"},
            {"MemberOrgID": 3, "MemberOrg": "Org3"},
            {"MemberOrgID": 4, "MemberOrg": "Org4"}
        ]
    });
    return table;
};

module.exports = fusionMock;