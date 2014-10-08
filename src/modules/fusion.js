var Promise = require('promise');
var moment = require('moment');
var _ = require('underscore');

var encodeQueryParam = function(x) {
    if (_.isString(x)) {
        if (x.indexOf('"') !== -1) throw new Error("Cannot include double-quotes in query");
        else return '"' + x + '"';
    }
    else if (_.isNumber(x)) {
        return x;
    }
    else if (_.isDate(x)) {
        return moment(x).format("YYYY.MM.DD");
    }
    else if (_.isNull(x)) {
        return "''";
    }
    else {
        throw new TypeError("Invalid query parameter type: " + typeof x);
    }
};

var encodeQueryURL = function(tableID, fields, filters, groupFields, key) {
    var select = (fields && fields.length > 0) ? "SELECT " + fields.join(', ') : "SELECT *";
    var where = (filters && filters.length > 0) ? " WHERE " + filters.join(' AND ') : "";
    var groupBy = (groupFields && groupFields.length > 0) ? " GROUP BY " + groupFields.join(', ') : "";
    
    var query = encodeURIComponent(select + " FROM " + tableID + where + groupBy);
    return (
        "https://www.googleapis.com/fusiontables/v1/query" 
        + "?sql=" + query
        + "&key=" + key
    );
};

var Fusion = function(tableID, httpClient) {
    this._ID = tableID;
    this._makeRequest = httpClient ? httpClient : Fusion.HTTPClient;
    
    if (!Fusion.APIKey) throw new Error("Fusion table initialized without defining API Key");
    if (!this._makeRequest) throw new Error("Fusion table initialized without an HTTP Client");
};

Fusion.prototype.fetch = function(query) {
    if (!query) query = {};
    
    var url = encodeQueryURL(this._ID, query.select, query.where, query.groupBy, Fusion.APIKey);
    var makeRequest = this._makeRequest;
    
    return new Promise(function(fulfill, reject) {
        makeRequest({uri: url, json: true}, function(error, response, body) {
            if (error) reject(error);
            else fulfill(body);
        });
    });
};

Fusion.recruitmentTable = "__recruitmentTable__";

Fusion.eql = function(field, x) {
    return field + " = " + encodeQueryParam(x);
};

Fusion.between = function(field, begin, endExcl) {
    return (
        field + " >= " + encodeQueryParam(begin)
        + " AND " + field + " < " + encodeQueryParam(endExcl)
    );
};

Fusion.in = function(field, options) {
    return (
        field + " IN ("
        + _.map(options.sort(), encodeQueryParam).join(", ")
        + ")"
    );
};

Fusion.notIn = function(field, options) {
    return (
        "NOT (" + field + " IN ("
        + _.map(options.sort(), encodeQueryParam).join(", ")
        + "))"
    );
};

Fusion.or = function() {
    return _.reduce(arguments, function(last, x) {
        return "(" + last + " OR " + x + ")";
    });
};

Fusion.gte = function(field, x) {
    return field + " >= " + encodeQueryParam(x);
};

Fusion.lt = function(field, x) {
    return field + " < " + encodeQueryParam(x);
};

module.exports = Fusion;
