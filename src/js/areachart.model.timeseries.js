function mkdate(y, m) {
  var d = new Date();
  d.setYear(y);
  d.setMonth(m - 1);
  return d.getTime();
}

var x = {
  ticks: [
    mkdate(2012, 1),
    mkdate(2012, 2),
    mkdate(2012, 3)
  ],
  format: function(time) {
    var date = new Date();
    date.setTime(time);
    return date.getMonth(date) + 1;
  }
}

var y = {
  ticks: [
    0,
    10,
    20,
    25
  ],
  format: function(y) {
    return y;
  }
}

module.exports = function() {
    return {
        x: x,
        y: y,
        data: [
          [
            { year: 2012, month: 1, value: 13 },
            { year: 2012, month: 2, value: 12 },
            { year: 2012, month: 3, value: 15 }
          ],
          [
            { year: 2012, month: 1, value: 21 },
            { year: 2012, month: 2, value: 22 },
            { year: 2012, month: 3, value: 22 }
          ]
        ],
        xaccessor: function(data){
          var d = new Date();
          d.setYear(data.year);
          d.setMonth(data.month - 1);
          return d.getTime();
        },
        yaccessor: function(d) { return d.value; },
        width: 600,
        height: 200,
        closed: true,
        color: function(index) {
          return index === 0 ? "#772211" : "#227711";
        },
    };
};
