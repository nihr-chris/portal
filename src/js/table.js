/**
 * Table.js
 * 
 * Fast, multivariate data tables with observable views.
 * 
 * Uses crossfilter.js (wrapped by simple-filter.js) for most of the 
 * difficult stuff.
 */

var util = require("./util.js");
var Filter = require('simple-filter');
var _ = require("underscore");


/**
 * Table
 * 
 * Represents a table of along with a set of views on the data.
 * 
 * Allows multiple views on the data to be created and can notify observers
 * when the data changes.
 * 
 * Does not currently support observing changes to the underlying dataset, 
 * but this could be added if needed.
 */

var Table = function(rows) {
    this._data = new Filter(rows);
    this._views = {};
    this._indexCounts = {};
};

Table.prototype.addView = function(view) {
    if (this._views[view.uid]) return;
    
    this._views[view.uid] = view;
    
    var instance = this;
    _.each(view.tableIndexes(), function(key) {
        if (instance._indexCounts[key]) {
            instance._indexCounts[key]++;
            
        } else {
            instance._indexCounts[key] = 1;
            instance._data.addIndex(key, function(row) {
                return row[key];
            });
        }
    });
    
    view.setup(this._data);
    this.notifyObservers("views");
};

Table.prototype.allValues = function(column) {
    return _.map(this._data.get(), function(row) {
        return row[column];
    });
};

Table.prototype.removeView = function(view) {
    var old = this._views[view.uid];
    if (!old) return;
    
    delete this._views[view.uid];
    
    var instance = this;
    _.each(view.tableIndexes(), function(key) {
        instance._indexCounts[key]--;
        
        if (instance._indexCounts[key] === 0) {
            instance._data.delIndex(key);
        }
    });
    
    view.teardown();
    this.notifyObservers("views");
};

Table.prototype.views = function() {
    return _.values(this._views);  
};

util.makeObservable(Table);


/**
 * View
 */

Table.View = function(filters) {
    this.uid = util.uid();
    this._filters = filters;
    this._value = [];
    
    var instance = this;
    _.each(filters, function(f) {
        f.addObserver("current", instance, "filtersChanged");
    });
};

Table.View.prototype.setup = function(data) {
    this._data = data;
    this.update();
};

Table.View.prototype.teardown = function(crossfilter) {
    var instance = this;
    _.each(this._filters, function(f) {
        f.removeObserver("current", instance);
    });
};

Table.View.prototype.tableIndexes = function() {
    return _.map(this._filters, util.getter("tableIndex"));
};

Table.View.prototype.filters = function() {
    return this._filters;
};

Table.View.prototype.value = function() {
    return this._value;
};

Table.View.prototype.update = function() {
    if (typeof this._data === "undefined") return;
    
    var filterValues = _.map(this._filters, function(f) {
        var entry = {};
        entry[f.tableIndex()] = f.current().predicate;
        return entry;
    });
   
    this._value = this._data.get(util.merge(filterValues));
    
    this.notifyObservers("value");
};

Table.View.prototype.filtersChanged = function() {
    this.update();
};

util.makeObservable(Table.View);


/**
 * Filter
 * 
 * options should be an array of objects each containing a predicate: 
 * 
 * {
 *   predicate: function(row){ return row.foo === "bar"; }
 * }
 * 
 * or omit the predicate field for a no-op filter.
 */

Table.Filter = function(tableIndex, options) {
    this._options = options;
    this._current = 0;
    this._tableIndex = tableIndex;
};

Table.Filter.prototype.tableIndex = function() {
    return this._tableIndex;
};

Table.Filter.prototype.options = function() {
    return this._options;
};

Table.Filter.prototype.selectOptionIndex = function(index) {
    this._current = index;
    this.notifyObservers("current");
};

Table.Filter.prototype.current = function() {
    return this._options[this._current];
};

util.makeObservable(Table.Filter);



module.exports = Table;
