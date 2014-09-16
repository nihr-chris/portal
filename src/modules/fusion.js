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


var Fusion = function(tableID, httpClient) {
    this._ID = tableID;
    this._makeRequest = httpClient ? httpClient : Fusion.HTTPClient;
    
    if (!this._makeRequest) throw new Error("Fusion table initialized without an HTTP Client");
};

Fusion.prototype.fetch = function(fields, filters) {
    var select = (fields && fields.length > 0) ? "SELECT " + fields.join(', ') : "SELECT *";
    var where = (filters && filters.length > 0) ? " WHERE " + filters.join(' AND ') : "";
    
    var query = encodeURIComponent(select + " FROM " + this._ID + where);
    var url = (
        "https://www.googleapis.com/fusiontables/v1/query" 
        + "?sql=" + query
        + "&key=" + Fusion.APIKey
    );
    
    var makeRequest = this._makeRequest;
    return new Promise(function(fulfill, reject) {
        makeRequest({uri: url, json: true}, function(error, response, body) {
            if (error) reject(error);
            else fulfill(body);
        });
    });
};

Fusion.eql = function(a, b) {
    return a + " = " + encodeQueryParam(b);
};

module.exports = Fusion;
