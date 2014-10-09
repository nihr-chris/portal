var expect      = require('chai').expect;
var assert      = require('chai').assert;
var _           = require("underscore");

var Operation   = require("../src/modules/operation.js");
var mocks       = require("./mocks.js");

module.exports = {
    expectOperation: function () {
        var makeOperation, module;
            
        if (arguments.length == 1) {
            module = Operation;
            makeOperation = arguments[0];
        } else {
            module = arguments[0];
            makeOperation = arguments[1];
        }
        
        function expectation(input, query, tableName, stubValues, expectedResult, expectedError) {
            var parent = mocks.rootOperation(input, module);
            
            if (tableName && stubValues) {
                var stubParams = _.clone(query);
                stubParams.values = stubValues;
            
                var table = parent[tableName];
                table.stub(stubParams);
            }
            
            var operation = makeOperation(parent);
                
            if (expectedError) {
                return operation.then(function(results) {
                    assert.fail(null, null, "Expected operation to fail.");
                }, function(error) {
                    expect(error.message).to.have.string(expectedError);
                });
                
            } else {
                return operation.then(function(results) {
                    expect(results).to.eql(expectedResult);
                });
            }
        }
        
        function expectOperationWithInputToMakeQuery(input, query, result) {
            return {
                onTable: function(table) {
                    return {
                        andReturnQueryResults: function() {
                            return expectation(input, query, table, result, result);
                        },
                        andReturn: function(expectedResult) {
                            return expectation(input, query, table, result, expectedResult);
                        }
                    };
                }
            };
        }
        
        function operationExpectationWithInput(input) {
            return {
                toMakeQuery: function(query) {
                    var next = expectOperationWithInputToMakeQuery(input, query, "RESULT");
                    next.withStubbedResult = function(result) {
                        return expectOperationWithInputToMakeQuery(input, query, result);
                    };
                    return next;
                },
                toReturn: function(value) {
                    return expectation(input, null, null, null, value);
                },
                toFailWithError: function(error) {
                    return expectation(input, null, null, null, null, error);
                }
            };
        }
        
        var next = operationExpectationWithInput([]);
        next.withInput = function(input) {
            return operationExpectationWithInput(input);
        };
        return next;
    }
};
