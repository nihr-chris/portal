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
 var moment     = require('moment');
 
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


Operation.prototype.withOperation = function(params) {
    util.checkArgs(arguments, {
        addedColumns: Array.of(String),
        inputColumns: [Array.of(String), null],
        rowValues: Function
    });
    
    return this.childOperation({
        inputColumns: params.inputColumns ? params.inputColumns : [],
        outputColumns: _.union(params.addedColumns, this.outputColumns),
        transform: function(rows) {
            return _.map(rows, function(row) {
                var result = _.clone(row);
                _.each(params.addedColumns, function(outputColumn) {
                    result[outputColumn] = params.rowValues(row, outputColumn);
                });
                return result;
            });
        }
    });
};  

/**
 * Private helper method for creating operations that summarize many rows into
 * fewer rows (similar to SQL's GROUP BY + aggregation functions).
 * 
 * Most of the common logic (/ugliness) for a summarizing operation lives here.
 * For example, count() calls this, passing in the additional logic specific to
 * counting.
 */
Operation.prototype.summarizeOperation = function(params) {
    util.checkArgs(arguments, {
        // Names of columns to group by
        groupBy: Array.of(String),
        
        // Function that takes an array of rows and writes summarized values to
        // one or more new columns
        summarize: Function,
        
        // Array of column names that are summarized by the summarize function.
        // These are deleted from the returned rows.
        summarizeColumns: Array.of(String),
        
        // Array of column names that are added by the summarize function. Used
        // for error-checking by child operations.
        addedColumns: Array.of(String)
    });
    
    var keptColumns = _.difference(this.outputColumns, params.summarizeColumns);
    
    return this.childOperation({
        inputColumns: _.union(params.summarizeColumns, params.groupBy),
        outputColumns: _.union(keptColumns, params.addedColumns),
        transform: function(rows) {
            // Group...
            var groups = _.groupBy(rows, function(row) {
                return JSON.stringify(_.pick(row, params.groupBy));
            });
            
            // And summarize...
            return _.map(groups, function(groupRows) {
                var result = {};
                var firstRow = groupRows[0];
                
                // Check that there isn't any variation within the group for each
                // unsummarized column. Raise an error if there is.
                
                // SQL would require all returned columns to either be grouped or 
                // passed to an aggregation function, but it's actually quite useful 
                // to copy across values from columns we aren't grouping by, while
                // checking that they would have been part of the same group if 
                // we'd included them in the groupBy array.
                _.each(groupRows, function(row) {
                    _.each(keptColumns, function(column) {
                        if (firstRow[column] !== row[column]) {
                            throw new Error(
                                "Column " + column + " has an ambiguous value that is "
                                + "not being grouped or summarized.\n"
                                + "Could be " + row[column] + " or " + firstRow[column]
                            );
                        }
                    });
                });
                
                // Take the first row's value for each unsummarized column
                _.each(keptColumns, function(column) {
                    result[column] = firstRow[column];
                });
                
                // Merge in the summarized column values
                params.summarize(groupRows, result);
                
                return result;
            });
        }
    });
};


Operation.prototype.onCompleted = function(completionHandler, errorHandler) {
    return this.promise.then(completionHandler, errorHandler);
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

Operation.prototype.getHLO1Studies = function(params) {
    var studyTable = this.dataSource.studyTable;
    var fields = ["StudyID"];
    
    return this.childOperation({
        inputColumns: [],
        outputColumns: fields,
        transform: function() {
            return studyTable.fetch({
                select: fields,
                where: [
                    Fusion.lt("ActualStartDate", params.endDate),
                    Fusion.or(Fusion.eql("ActualEndDate", null), Fusion.gte("ActualEndDate", params.startDate))
                ],
                groupBy: ["StudyID"]
            });
        }
    });
};

Operation.prototype.getHLO2Studies = function(params) {
    var columns = ["StudyID", "TrustID", "FullTitle", "Banding", "ActualStartDate", "ExpectedEndDate", "ActualEndDate"];
    var studyTable = this.dataSource.studyTable;
    
    var conditions = [
        Fusion.gte("PortfolioQualificationDate", new Date(2010, 3, 1)),
        Fusion.eql("ProjectStatus", "Blue"),
        Fusion.notIn("RecruitmentInformationStatus", ["No NHS Support", "Sample Data: No Consent Requested"]),
    ];
    
    if (params.commercial) {
        conditions.push(Fusion.eql("Commercial", 1));
    } else {
        conditions.push(Fusion.eql("Commercial", 0));
    }
    
    if (params.closed) {
        conditions.push(Fusion.in("ActiveStatus", ["Closed - in follow-up", "Closed - follow-up complete"]));
        conditions.push(Fusion.between("ActualEndDate", params.startDate, params.endDate));
    } else {
        conditions.push(Fusion.eql("ActiveStatus", "Open"));
        conditions.push(Fusion.gte("ActualStartDate", new Date("2010-04-01")));
    }
    
    return this.childOperation({
        inputColumns: [],
        outputColumns: columns,
        transform: function() {
            return studyTable.fetch({
                select: columns,
                where: conditions
            });
        }
    });
};

Operation.prototype.withValues = function(fieldMap) {
    return this.withOperation({
        addedColumns: _.keys(fieldMap),
        rowValues: function(row, outputColumn) {
            return fieldMap[outputColumn];
        }
    });
};

Operation.prototype.withFieldValues = function(fieldMap) {
    return this.withOperation({
        inputColumns: _.values(fieldMap),
        addedColumns: _.keys(fieldMap),
        rowValues: function(row, outputColumn) {
            var sourceColumn = fieldMap[outputColumn];
            return row[sourceColumn];
        }
    });
};

Operation.prototype.withTrustName = function(fieldMap) {
    var dataSource = this.dataSource;
    
    return this.withOperation({
        inputColumns: _.values(fieldMap),
        addedColumns: _.keys(fieldMap),
        rowValues: function(row, outputColumn) {
            var sourceColumn = fieldMap[outputColumn];
            return dataSource.trustName(row[sourceColumn]);
        }
    });
};

Operation.prototype.withFY = function(fieldMap) {
    return this.withOperation({
        inputColumns: _.values(fieldMap),
        addedColumns: _.keys(fieldMap),
        rowValues: function(row, outputColumn) {
            var dateColumn = fieldMap[outputColumn];
            return util.getFY(row[dateColumn]);
        }
    });
};

Operation.prototype.justFields = function(fields) {
    return this.childOperation({
        inputColumns: fields,
        outputColumns: fields,
        transform: function(rows) {
            return _.map(rows, function(r) {
                return _.pick(r, fields);
            });
        }
    });
};

Operation.prototype.count = function(params) {
    util.checkArgs(arguments, {
        valuesFromField: String,
        inFields: Object,
        groupBy: Array.of(String)
    });
    
    var valueColumnMap = params.inFields;
    var countedColumn = params.valuesFromField;
    
    return this.summarizeOperation({
        summarizeColumns: [countedColumn],
        addedColumns: _.values(valueColumnMap),
        
        groupBy: params.groupBy,
        summarize: function(rows, summary) {
            _.each(valueColumnMap, function(column) {
                summary[column] = 0;
            });
            
            _.each(rows, function(row) {
                var value = row[countedColumn];
                var sumColumn = valueColumnMap[value];
                
                if (sumColumn) {
                    summary[sumColumn] += 1;
                    
                } else {
                    console.log(value);
                    console.log(JSON.stringify(row));
                    throw new Error(
                        "Unexpected value " + value + " in column " + countedColumn
                    );
                }
            });
        }
    });
};

Operation.prototype.sum = function(params) {
    util.checkArgs(arguments, {
        valuesFromField: String,
        inField: Object,
        groupBy: Array.of(String)
    });
    
    var totalColumn = params.inField;
    var summedColumn = params.valuesFromField;
    
    return this.summarizeOperation({
        summarizeColumns: [summedColumn],
        addedColumns: [summedColumn],
        
        groupBy: params.groupBy,
        summarize: function(rows, summary) {
            function sumField(total, row) {
                return total + row[summedColumn];
            }
            
            summary[totalColumn] = _.reduce(rows, sumField, 0);
        }
    });
};

Operation.prototype.accumulate = function(params) {
    var totalField = params.inField;
    var summedField = params.field;
    var groupFields = params.overFields;
    
    return this.childOperation({
        inputColumns: groupFields.concat([summedField]),
        outputColumns: this.outputColumns.concat([totalField]),
        transform: function(rows) {
            var rowGroups = _.groupBy(rows, function(row) {
                return JSON.stringify(_.pick(row, groupFields));
            });
            
            _.each(rowGroups, function(groupRows) {
                 var total = 0;
                 _.each(groupRows, function(row) {
                     total += row[summedField];
                     row[totalField] = total;
                 });
            });
            
            return _.flatten(_.values(rowGroups));
        }
    });
};

Operation.prototype.union = function(otherOperation) {
    return this.childOperation({
        inputColumns: otherOperation.outputColumns,
        outputColumns: otherOperation.outputColumns,
        transform: function(rows) {
            return otherOperation.promise.then(function(otherRows) {
                return _.union(rows, otherRows);
            });
        }
    });
};

Operation.prototype.withDurations = function(columns) {
    util.checkArgs(arguments, Array.of(
        {between: String, and: String, in: String}
    ));
    
    var columnMap = util.hashArray("in", columns);
    
    return this.withOperation({
        inputColumns: _.map(columns, "between").concat(_.map(columns, "and")),
        addedColumns: _.map(columns, "in"),
        rowValues: function(row, outputColumn) {
            var sourceInfo = columnMap[outputColumn];
            
            var dateFrom = row[sourceInfo.between];
            var dateTo = row[sourceInfo.and];
            
            return moment(dateTo).diff(dateFrom, "d");
        }
    });
};


module.exports = Operation;
