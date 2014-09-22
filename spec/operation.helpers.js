var expect      = require('chai').expect;
var assert      = require('chai').assert;
var _           = require("underscore");

var mocks       = require("./mocks.js");

module.exports = {
    expectOperation: function (makeOperation) {
        function expectation(input, query, tableName, stubValues, expectedResult, expectedError) {
            var parent = mocks.rootOperation(input);
            
            if (tableName && stubValues) {
                var stubParams = _.clone(query);
                stubParams.values = stubValues;
            
                var table = parent.dataSource[tableName];
                table.stub(stubParams);
            }
            
            var operation = makeOperation(parent);
                
            if (expectedError) {
                return operation.onCompleted(function(results) {
                    assert.fail(null, null, "Expected operation to fail.");
                }, function(error) {
                    expect(error.message).to.have.string(expectedError);
                });
                
            } else {
                return operation.onCompleted(function(results) {
                    expect(results).to.eql(expectedResult);
                }, function(error) {
                    assert.fail(null, null, "Expected operation to succeed.");
                });
            }
        }
        
        function expectOperationWithInputToMakeQuery(input, query) {
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
        
        // Todo: these functions are chained to customize the expectation.
        // Could probably be made less ugly.
        return {
            toMakeQuery: function(query) {
                return expectOperationWithInputToMakeQuery(null, query);
            },
            withInput: function(input) {
                return {
                    toMakeQuery: function(query) {
                        return expectOperationWithInputToMakeQuery(input, query);
                    },
                    toReturn: function(value) {
                        return expectation(input, null, null, null, value);
                    },
                    toFailWithError: function(error) {
                        return expectation(input, null, null, null, null, error);
                    }
                }
            }
        };
    }
};
