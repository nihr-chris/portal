/**
 * Table.js
 * 
 * Fast, multivariate data tables with observable views.
 * 
 * Uses crossfilter.js (wrapped by simple-filter) for most of the 
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

var Table = function(data) {
    this._filter = new Filter(data);
    this._views = {};
    this._indexCounts = {};
};

Table.prototype.addView = function(view) {
    if (this._views[view.uid]) return;
    
    this._views[view.uid] = view;
    
    var instance = this;
    _.each(view.indexes(), function(key) {
        if (instance._indexCounts[key]) {
            instance._indexCounts[key]++;
            
        } else {
            instance._indexCounts[key] = 1;
            instance._filter.addIndex(key, function(row) {
                return row[key];
            });
        }
    });
    
    this.notifyObservers("views");
};

Table.prototype.removeView = function(view) {
    var old = this._views[view.uid];
    if (!old) return;
    
    delete this._views[view.uid];
    
    var instance = this;
    _.each(view.tableIndexes(), function(key) {
        instance._indexCounts[key]--;
        
        if (instance._indexCounts[key] === 0) {
            instance.delIndex(key);
        }
    });
    
    this.notifyObservers("views");
};

Table.prototype.views = function() {
    return _.values(this._views);  
};

util.makeObservable(Table);


/**
 * View
 */

Table.View = function(name, filters) {
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

Table.view.prototype.tableIndexes = function() {
    return _.flatten(_.map(this._filters, 'tableIndex'));
};

Table.View.value = function() {
    return this._value;
};

Table.View.update = function() {
    var filterValues = _.map(this._filters, function(f){ return f.current(); });
    this._value = this._data.get(util.merge(filterValues));
    
    this.notifyObservers("value");
};

Table.View.filtersChanged = function() {
    this.update();
};

util.makeObservable(Table.View);


/**
 * Filter
 */

/**
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
