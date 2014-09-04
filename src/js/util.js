function hashArray(idKey, array) {
    var hash = {};
    array.forEach(function(x) {
        hash[x[idKey]] = x; 
    });
    return hash;
}

module.exports = {
    hashArray: hashArray
};
