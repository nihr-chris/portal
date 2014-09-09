var _ = require("underscore");

var filterFn = function(key) {
    return function(expected) {
        return {id: expected, pred: function(row) { return row[key] === expected; }};
    };
};

var DataStore = function(data) {
    this.data = data;
    this.series = [];
    this.reportsBySeries = {};
};

DataStore.prototype.addSeries = function(s) {
    this.series.push(s);
    this.updateReport(s);
};

DataStore.prototype.querySeries = function(series) {
    var filters = [
        series.network, 
        series.division, 
        series.specialty, 
        series.site
    ];
    
    var matches = _.filter(this.data, function(row) {
        return _.every(filters, function(f) {
            return f.pred(row); 
        });
    });
    
    var byDate = {};
    _.each(matches, function(row) {
        var prev = byDate[row.date] ? byDate[row.date] : 0;
        byDate[row.date] = prev + row.val;
    });
    
    return byDate;
};

DataStore.prototype.updateReport = function(series) {
    var datapoints = [];
    
    _.each(this.querySeries(series), function(total, date) {
        datapoints.push([new Date(date), total]); 
    });
    
    this.reportsBySeries[series] = {
        color: "",
        
        // datapoints sorted by date (first element)
        points: _.sortBy(datapoints, function(x) {
            return x[0];
        })
    };
};

DataStore.prototype.byMonthReport = function() {
    return _.values(this.reportsBySeries);
};

module.exports = {
    series: function(color, network, division, specialty, site) {
        return {
            color: color, 
            network: network, 
            division: division, 
            specialty: specialty, 
            site: site
        };
    },
    
    all: function(id) {
        return {id: id, pred: function(row){ return true; }};
    },
    
    filterNetwork: filterFn("net"),
    filterDivision: filterFn("div"),
    filterSpecialty: filterFn("sp"),
    filterSite: filterFn("si"),
    
    DataStore: DataStore
};
