var Ractive = window.Ractive;
var _ = require("underscore");

var util = require("./util.js");
var template = require("template");
var timeseries = require("./chartmodel.timeseries.js");
var Table = require("./table.js");

var table = new Table([
    {trust: "Croydon Health Services NHS Trust", date: new Date("Apr 1 2013"), target: 33, actual: 16},
    {trust: "Croydon Health Services NHS Trust", date: new Date("May 1 2013"), target: 66, actual: 29},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Jun 1 2013"), target: 99, actual: 38},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Jul 1 2013"), target: 132, actual: 57},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Aug 1 2013"), target: 165, actual: 75},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Sep 1 2013"), target: 198, actual: 93},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Oct 1 2013"), target: 231, actual: 126},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Nov 1 2013"), target: 264, actual: 152},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Dec 1 2013"), target: 297, actual: 184},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Jan 1 2014"), target: 330, actual: 230},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Feb 1 2014"), target: 363, actual: 303},
    {trust: "Croydon Health Services NHS Trust", date: new Date("Mar 1 2014"), target: 396, actual: 396},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Apr 1 2013"), target: 42, actual: 64},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("May 1 2013"), target: 84, actual: 116},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Jun 1 2013"), target: 126, actual: 181},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Jul 1 2013"), target: 168, actual: 235},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Aug 1 2013"), target: 210, actual: 262},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Sep 1 2013"), target: 252, actual: 281},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Oct 1 2013"), target: 294, actual: 302},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Nov 1 2013"), target: 336, actual: 317},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Dec 1 2013"), target: 378, actual: 343},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Jan 1 2014"), target: 420, actual: 367},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Feb 1 2014"), target: 462, actual: 384},
    {trust: "Epsom and St Helier University Hospitals NHS Trust", date: new Date("Mar 1 2014"), target: 504, actual: 410},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Apr 1 2013"), target: 689, actual: 1383},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("May 1 2013"), target: 1378, actual: 2657},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Jun 1 2013"), target: 2067, actual: 3794},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Jul 1 2013"), target: 2756, actual: 5011},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Aug 1 2013"), target: 3445, actual: 6030},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Sep 1 2013"), target: 4134, actual: 7193},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Oct 1 2013"), target: 4823, actual: 8359},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Nov 1 2013"), target: 5512, actual: 9541},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Dec 1 2013"), target: 6201, actual: 10340},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Jan 1 2014"), target: 6890, actual: 11464},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Feb 1 2014"), target: 7579, actual: 12587},
    {trust: "Guy's and St Thomas' NHS Foundation Trust", date: new Date("Mar 1 2014"), target: 8268, actual: 19838},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Apr 1 2013"), target: 438, actual: 636},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("May 1 2013"), target: 876, actual: 1139},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Jun 1 2013"), target: 1314, actual: 1483},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Jul 1 2013"), target: 1752, actual: 1885},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Aug 1 2013"), target: 2190, actual: 2425},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Sep 1 2013"), target: 2628, actual: 2867},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Oct 1 2013"), target: 3066, actual: 3651},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Nov 1 2013"), target: 3504, actual: 4533},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Dec 1 2013"), target: 3942, actual: 5251},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Jan 1 2014"), target: 4380, actual: 6182},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Feb 1 2014"), target: 4818, actual: 7042},
    {trust: "King's College Hospital NHS Foundation Trust", date: new Date("Mar 1 2014"), target: 5256, actual: 8033},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Apr 1 2013"), target: 8, actual: 9},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("May 1 2013"), target: 16, actual: 9},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Jun 1 2013"), target: 24, actual: 10},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Jul 1 2013"), target: 32, actual: 26},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Aug 1 2013"), target: 40, actual: 39},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Sep 1 2013"), target: 48, actual: 53},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Oct 1 2013"), target: 56, actual: 79},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Nov 1 2013"), target: 64, actual: 108},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Dec 1 2013"), target: 72, actual: 133},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Jan 1 2014"), target: 80, actual: 164},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Feb 1 2014"), target: 88, actual: 174},
    {trust: "Kingston Hospital NHS Foundation Trust", date: new Date("Mar 1 2014"), target: 96, actual: 193},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Apr 1 2013"), target: 22, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("May 1 2013"), target: 44, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Jun 1 2013"), target: 66, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Jul 1 2013"), target: 88, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Aug 1 2013"), target: 110, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Sep 1 2013"), target: 132, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Oct 1 2013"), target: 154, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Nov 1 2013"), target: 176, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Dec 1 2013"), target: 198, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Jan 1 2014"), target: 220, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Feb 1 2014"), target: 242, actual: 0},
    {trust: "Lewisham Healthcare NHS Trust", date: new Date("Mar 1 2014"), target: 264, actual: 0},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Apr 1 2013"), target: 19, actual: 31},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("May 1 2013"), target: 38, actual: 51},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Jun 1 2013"), target: 57, actual: 69},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Jul 1 2013"), target: 76, actual: 93},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Aug 1 2013"), target: 95, actual: 179},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Sep 1 2013"), target: 114, actual: 272},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Oct 1 2013"), target: 133, actual: 333},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Nov 1 2013"), target: 152, actual: 355},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Dec 1 2013"), target: 171, actual: 370},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Jan 1 2014"), target: 190, actual: 377},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Feb 1 2014"), target: 209, actual: 407},
    {trust: "Oxleas NHS Foundation Trust", date: new Date("Mar 1 2014"), target: 228, actual: 430},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Apr 1 2013"), target: 3, actual: 8},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("May 1 2013"), target: 6, actual: 14},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Jun 1 2013"), target: 9, actual: 20},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Jul 1 2013"), target: 12, actual: 31},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Aug 1 2013"), target: 15, actual: 42},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Sep 1 2013"), target: 18, actual: 51},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Oct 1 2013"), target: 21, actual: 61},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Nov 1 2013"), target: 24, actual: 68},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Dec 1 2013"), target: 27, actual: 78},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Jan 1 2014"), target: 30, actual: 78},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Feb 1 2014"), target: 33, actual: 78},
    {trust: "The Royal Hospital For Neuro-Disability", date: new Date("Mar 1 2014"), target: 36, actual: 95},
    {trust: "South London Primary Care", date: new Date("Apr 1 2013"), target: 208, actual: 212},
    {trust: "South London Primary Care", date: new Date("May 1 2013"), target: 416, actual: 451},
    {trust: "South London Primary Care", date: new Date("Jun 1 2013"), target: 624, actual: 742},
    {trust: "South London Primary Care", date: new Date("Jul 1 2013"), target: 832, actual: 1078},
    {trust: "South London Primary Care", date: new Date("Aug 1 2013"), target: 1040, actual: 1468},
    {trust: "South London Primary Care", date: new Date("Sep 1 2013"), target: 1248, actual: 1777},
    {trust: "South London Primary Care", date: new Date("Oct 1 2013"), target: 1456, actual: 2125},
    {trust: "South London Primary Care", date: new Date("Nov 1 2013"), target: 1664, actual: 2405},
    {trust: "South London Primary Care", date: new Date("Dec 1 2013"), target: 1872, actual: 2575},
    {trust: "South London Primary Care", date: new Date("Jan 1 2014"), target: 2080, actual: 2835},
    {trust: "South London Primary Care", date: new Date("Feb 1 2014"), target: 2288, actual: 3043},
    {trust: "South London Primary Care", date: new Date("Mar 1 2014"), target: 2496, actual: 3369},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Apr 1 2013"), target: 274, actual: 119},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("May 1 2013"), target: 548, actual: 251},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Jun 1 2013"), target: 822, actual: 353},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Jul 1 2013"), target: 1096, actual: 510},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Aug 1 2013"), target: 1370, actual: 626},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Sep 1 2013"), target: 1644, actual: 786},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Oct 1 2013"), target: 1918, actual: 1039},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Nov 1 2013"), target: 2192, actual: 1202},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Dec 1 2013"), target: 2466, actual: 1300},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Jan 1 2014"), target: 2740, actual: 1467},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Feb 1 2014"), target: 3014, actual: 1612},
    {trust: "South London and Maudsley NHS Foundation Trust", date: new Date("Mar 1 2014"), target: 3288, actual: 1767},
    {trust: "South London Healthcare NHS Trust", date: new Date("Apr 1 2013"), target: 67, actual: 40},
    {trust: "South London Healthcare NHS Trust", date: new Date("May 1 2013"), target: 134, actual: 107},
    {trust: "South London Healthcare NHS Trust", date: new Date("Jun 1 2013"), target: 201, actual: 181},
    {trust: "South London Healthcare NHS Trust", date: new Date("Jul 1 2013"), target: 268, actual: 228},
    {trust: "South London Healthcare NHS Trust", date: new Date("Aug 1 2013"), target: 335, actual: 295},
    {trust: "South London Healthcare NHS Trust", date: new Date("Sep 1 2013"), target: 402, actual: 338},
    {trust: "South London Healthcare NHS Trust", date: new Date("Oct 1 2013"), target: 469, actual: 338},
    {trust: "South London Healthcare NHS Trust", date: new Date("Nov 1 2013"), target: 536, actual: 338},
    {trust: "South London Healthcare NHS Trust", date: new Date("Dec 1 2013"), target: 603, actual: 344},
    {trust: "South London Healthcare NHS Trust", date: new Date("Jan 1 2014"), target: 670, actual: 349},
    {trust: "South London Healthcare NHS Trust", date: new Date("Feb 1 2014"), target: 737, actual: 350},
    {trust: "South London Healthcare NHS Trust", date: new Date("Mar 1 2014"), target: 804, actual: 350},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Apr 1 2013"), target: 29, actual: 10},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("May 1 2013"), target: 58, actual: 35},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Jun 1 2013"), target: 87, actual: 55},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Jul 1 2013"), target: 116, actual: 95},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Aug 1 2013"), target: 145, actual: 147},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Sep 1 2013"), target: 174, actual: 190},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Oct 1 2013"), target: 203, actual: 244},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Nov 1 2013"), target: 232, actual: 265},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Dec 1 2013"), target: 261, actual: 276},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Jan 1 2014"), target: 290, actual: 290},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Feb 1 2014"), target: 319, actual: 314},
    {trust: "South West London and St George's Mental Health NHS Trust", date: new Date("Mar 1 2014"), target: 348, actual: 348},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Apr 1 2013"), target: 297, actual: 318},
    {trust: "St George's Healthcare NHS Trust", date: new Date("May 1 2013"), target: 594, actual: 652},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Jun 1 2013"), target: 891, actual: 952},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Jul 1 2013"), target: 1188, actual: 1307},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Aug 1 2013"), target: 1485, actual: 1625},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Sep 1 2013"), target: 1782, actual: 2017},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Oct 1 2013"), target: 2079, actual: 2379},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Nov 1 2013"), target: 2376, actual: 2715},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Dec 1 2013"), target: 2673, actual: 3094},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Jan 1 2014"), target: 2970, actual: 3488},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Feb 1 2014"), target: 3267, actual: 3896},
    {trust: "St George's Healthcare NHS Trust", date: new Date("Mar 1 2014"), target: 3564, actual: 4346},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Apr 1 2013"), target: 154, actual: 321},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("May 1 2013"), target: 308, actual: 551},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Jun 1 2013"), target: 462, actual: 791},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Jul 1 2013"), target: 616, actual: 1002},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Aug 1 2013"), target: 770, actual: 1165},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Sep 1 2013"), target: 924, actual: 1424},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Oct 1 2013"), target: 1078, actual: 1702},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Nov 1 2013"), target: 1232, actual: 1937},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Dec 1 2013"), target: 1386, actual: 2137},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Jan 1 2014"), target: 1540, actual: 2385},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Feb 1 2014"), target: 1694, actual: 2617},
    {trust: "The Royal Marsden NHS Foundation Trust", date: new Date("Mar 1 2014"), target: 1848, actual: 2846},
    {trust: "CRN Wide", date: new Date("Apr 1 2013"), target: 2283, actual: 3167},
    {trust: "CRN Wide", date: new Date("May 1 2013"), target: 4566, actual: 6062},
    {trust: "CRN Wide", date: new Date("Jun 1 2013"), target: 6849, actual: 8669},
    {trust: "CRN Wide", date: new Date("Jul 1 2013"), target: 9132, actual: 11558},
    {trust: "CRN Wide", date: new Date("Aug 1 2013"), target: 11415, actual: 14378},
    {trust: "CRN Wide", date: new Date("Sep 1 2013"), target: 13698, actual: 17342},
    {trust: "CRN Wide", date: new Date("Oct 1 2013"), target: 15981, actual: 20738},
    {trust: "CRN Wide", date: new Date("Nov 1 2013"), target: 18264, actual: 23936},
    {trust: "CRN Wide", date: new Date("Dec 1 2013"), target: 20547, actual: 26425},
    {trust: "CRN Wide", date: new Date("Jan 1 2014"), target: 22830, actual: 29676},
    {trust: "CRN Wide", date: new Date("Feb 1 2014"), target: 25113, actual: 32807},
    {trust: "CRN Wide", date: new Date("Mar 1 2014"), target: 27396, actual: 42421}
]);

function recruitmentFilter(name, column) {
    var rowValues = _.uniq(table.allValues(column)).sort();
    return new Table.Filter(column, _.map(rowValues, function(val) {
        return {
            label: val,
            predicate: val
        };
    }));
}

// [hack] - Table doesn't work unless there is at least one indexed column. 
table.addView(new Table.View([
    new Table.Filter("trust", [
        {predicate: function(x){return true}}
    ])
]));

module.exports = Ractive.extend({
    template: template('recruitment'),
    init: function () {
        var component = this;
        
        component.set('addView', function() {
            var view = new Table.View([
                recruitmentFilter("Trust", "trust")
            ]);
            
            table.addView(view);
            component.push('views', view);
        });
        
        component.set('removeView', function(view) {
            var index = _.indexOf(component.data.views, view);
            
            if (index != -1) {
                table.removeView(view);
                component.data.views.splice(index, 1);
            }
        });
        
        component.set('views', []);
    },
    data: {
        chartModel: timeseries([
            {
                color: "#FF2200",
                points: [
                    [new Date(1, 2, 2014), 20],
                    [new Date(1, 3, 2014), 30],
                    [new Date(1, 4, 2014), 60],
                    [new Date(1, 5, 2014), 70],
                ]
            },
            {
                color: "#2200FF",
                points: [
                    [new Date(1, 2, 2014), 100],
                    [new Date(1, 3, 2014), 30],
                    [new Date(1, 4, 2014), 30],
                    [new Date(1, 5, 2014), 10],
                ]
            }
            
        ])
    }
});
