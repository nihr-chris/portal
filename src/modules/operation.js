/**
 * Operation
 * 
 * An operation represents a function that returns rows of structured data, 
 * possibly also accepting input rows that it transforms to return the output rows.
 * 
 * We use an Operation object instead of a raw function because it simplifies
 * a few things:
 * 
 * Long-running & Asynchronous operations (eg. network requests):
 *      bla bla
 * 
 * Chaining operations together:
 *      bla bla
 * 
 * Error handling / fail-fast:
 *      bla bla
 * 
 * Operations should generally do one well-defined task.
 */
 
 var _          = require('underscore');
 var Promise    = require('promise');
 
 var util       = require("./util.js");
 var DataSource = require("./datasource.js");
 var Fusion     = require("./fusion.js");
 

var Operation = function(params) {
    util.checkArgs(arguments, {
        dataSource: DataSource,
        outputColumns: Array.of(String),
        promise: Promise
    });
    
    this.dataSource = params.dataSource;
    this.outputColumns = params.outputColumns;
    this.promise = params.promise;
};


/**
 * This is a more convenient way of creating a child operation than just using
 * `new Operation()`. It automatically checks that the parent will return the right
 * columns and wraps the transform function inside a promise.
 */
Operation.prototype.childOperation = function(params) {
    util.checkArgs(arguments, {
        inputColumns: Array.of(String),
        outputColumns: Array.of(String),
        transform: Function
    });
    
    var incomingColumns = this.outputColumns;
    var requiredColumns = params.inputColumns;
    
    var missingColumns = _.difference(requiredColumns, incomingColumns);
    if (missingColumns.length > 0) {
        throw new Error("Child operation is incompatible with parent "
            + "as it requires columns missing from the parent: "
            + missingColumns.join(", "));
    }
    
    return new Operation({
        dataSource: this.dataSource,
        outputColumns: params.outputColumns,
        promise: this.promise.then(params.transform)
    });
};


Operation.prototype.onCompleted = function(completionHandler) {
    return this.promise.then(completionHandler);
};


/**
 * Common operations
 */

Operation.prototype.monthlyRecruitment = function(params) {
    util.checkArgs(arguments, {
        forEach: [null, Array.of(String)],
        from: Date,
        until: Date
    });
    
    _.defaults(params, {
        forEach: []
    });
    
    var groupByColumns = params.forEach;
    var recruitment = this.dataSource.recruitmentTable;
    
    return this.childOperation({
        inputColumns: ["StudyID"],
        outputColumns: groupByColumns.concat(["Month"]),
        transform: function(input) {
            var studyIDs = _.map(input, "StudyID"); 
    
            return recruitment.fetch({
                select: groupByColumns.concat([
                    "Month", "SUM(MonthRecruitment) AS RecruitmentCount"]),
                where: [
                    Fusion.between("Month", params.from, params.until),
                    Fusion.in("StudyID", studyIDs)
                ],
                groupBy: ["Month"].concat(groupByColumns)
            });
        }
    });
};

module.exports = Operation;
