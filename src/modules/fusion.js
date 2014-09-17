var Promise = require('promise');
var _ = require('underscore');

var encodeQueryParam = function(x) {
    if (typeof x === "string") {
        if (x.indexOf('"') !== -1) throw new Error("Cannot include double-quotes in query");
        else return '"' + x + '"';
    }
    else if (typeof x === "number") {
        return x;
    }
    else {
        throw new TypeError("Invalid query parameter type: " + typeof x);
    }
};

var encodeQueryURL = function(tableID, fields, filters, key) {
    var select = (fields && fields.length > 0) ? "SELECT " + fields.join(', ') : "SELECT *";
    var where = (filters && filters.length > 0) ? " WHERE " + filters.join(' AND ') : "";
    
    var query = encodeURIComponent(select + " FROM " + tableID + where);
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

Fusion.prototype.fetch = function(fields, filters) {
    var url = encodeQueryURL(this._ID, fields, filters, Fusion.APIKey);
    var makeRequest = this._makeRequest;
    
    return new Promise(function(fulfill, reject) {
        makeRequest({uri: url, json: true}, function(error, response, body) {
            if (error) reject(error);
            else fulfill(body);
        });
    });
};

Fusion.mock = function(responses) {
    var queryKey = function(fields, filters) {
        return JSON.stringify([fields, filters]);
    };
    
    var stubMap = {};
    _.each(responses, function(x) {
        stubMap[queryKey(x[0])] = x[1]; 
    });
    
    return {
        fetch: function(fields, filters) {
            var query = queryKey(fields, filters);
            
            if (stubMap[query]) {
                return Promise.resolve(stubMap[query]);
                
            } else {
                throw new Error(
                    "Unstubbed query invoked on mock Fusion Table.\n"
                    + "- Query was: " + query + "\n"
                    + "- Stubbed queries are: " + JSON.stringify(_.keys(stubMap))
                );
            }
        }
    };
};

Fusion.eql = function(field, x) {
    return field + " = " + encodeQueryParam(x);
};

Fusion.between = function(field, begin, endExcl) {
    return (
        field + " >= " + encodeQueryParam(begin)
        + field + "<" + encodeQueryParam(endExcl)
    );
};

Fusion.in = function(field, options) {
    return (
        field + " in ("
        + _.map(options, encodeQueryParam).join(", ")
        + ")"
    );
};

module.exports = Fusion;
