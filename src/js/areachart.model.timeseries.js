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
            [new Date(2012, 1, 13), 13],
            [new Date(2012, 2, 13), 12],
            [new Date(2012, 3, 13), 15]
          ],
          [
            [new Date(2012, 1, 13), 5],
            [new Date(2012, 2, 13), 6],
            [new Date(2012, 3, 13), 7]
          ]
        ],
        xaccessor: function(point){
          return point[0].getTime();
        },
        yaccessor: function(point) { 
          return point[1]; 
        },
        width: 600,
        height: 200,
        closed: true,
        color: function(index) {
          return index === 0 ? "#772211" : "#227711";
        },
    };
};
