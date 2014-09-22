var expect      = require('chai').expect;
var _           = require("underscore");

var mocks       = require("./mocks.js");

module.exports = {
    expectOperation: function (makeOperation) {
        function expectation(input, query, tableName, stubValues, expectedResult) {
            var parent = mocks.rootOperation(input);
            var table = parent.dataSource[tableName];
            
            var stubParams = _.clone(query);
            stubParams.values = stubValues;
            
            table.stub(stubParams);
            var operation = makeOperation(parent);
            
            return operation.onCompleted(function(results) {
                expect(results).to.eql(expectedResult);
            });
        }
        
        // Todo: these functions are chained to customize the expectation.
        // Could probably be made less ugly.
        return {
            withInput: function(input) {
                return {
                    toMakeQuery: function(query) {
                        return {
                            onTable: function(table) {
                                return {
                                    andReturnQueryResults: function() {
                                        var result = "RESULT";
                                        return expectation(input, query, table, result, result);
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
    }
};
