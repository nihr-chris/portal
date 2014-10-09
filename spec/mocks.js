var _           = require('underscore');
var Promise     = require('promise');

var Fusion      = require("../src/modules/fusion.js");
var Operation   = require("../src/modules/operation.js");

var mocks = {
    fusionTable: function() {
        var queryKey= function(query) {
            if (!query.select) query.select = [];
            if (!query.where) query.where = [];
            if (!query.groupBy) query.groupBy = [];
            
            return (
                "select " + query.select.sort().join(", ") + "\n"
                + "where " + query.where.sort().join(", ") + "\n"
                + "group by " + query.groupBy.sort().join(", ")
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
    },
    
    trustTable: function() {
        var table = mocks.fusionTable();
        
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
    },
    
    rootOperation: function(rows, module) {
        if (!module) module = Operation;
        var columnNames = rows ? _.keys(rows[0]) : [];
        
        return new module({
            outputColumns: columnNames,
            promise: Promise.resolve(rows),
            references: {
                recruitmentTable: mocks.fusionTable(),
                studyTable: mocks.trustTable()
            }
        });
    }
};
    
module.exports = mocks;
