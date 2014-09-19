// var expect = require('chai').expect;
// var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

// var _ = require("underscore");
// var Promise = require("promise");

// var DataSource = require("../src/modules/datasource.js");
// var Fusion = require("../src/modules/fusion.js");

// var fusionMock = require('./fusion.mock.js');

// describe("DataSource", function() {
//     var data;
    
//     function testProcessingFunction(params) {
//         var expectedValues = params.values ? params.values : "EXPECTED";
        
//         if (params.table) {
//             params.query.values = expectedValues;
//             params.table.stub(params.query);
//         }
        
//         if (params.ignoreOrdering) {
//             expectedValues.sort();
            
//             return params.fn(params.inputValues)
//                 .then(function(values) {
//                     expect(values.sort()).to.eql(expectedValues);
//                 });
                
//         } else {
//             return params.fn(params.inputValues)
//                 .then(function(values) {
//                     expect(values).to.eql(expectedValues);
//                 });
//         }
//     }
    
//     beforeEach(function(){
//         return data.waitForLoad;
//     });
    
//     describe("Trust Mapping", function() {
//         it("should return trust name", function() {
//             expect(data.trustName(1)).to.eql("Org1");
//         });
        
//         it("should return trust id", function() {
//             expect(data.trustID("Org1")).to.eql(1);
//         });
//     });
    
//     describe("getNonCommercialStudies", function() {
//         it("should fetch only noncommercial studies", function() {
//             return testProcessingFunction({
//                 table: data.studyTable,
//                 query: {
//                     select: ["StudyID"],
//                     where: [Fusion.eql("Commercial", 0)]
//                 },
//                 fn: data.getNonCommercialStudies()
//             });
//         });
//     });
    
//     describe("monthlyRecruitment", function() {
//         var startDate = new Date(2011, 3, 1);
//         var endDate = new Date(2012, 3, 1);
        
//         var studyIDs = [1, 2];
//         var studyIDRows = [{StudyID: 1}, {StudyID: 2}];
                
//         describe("when grouping specified", function(){
//           it("should return sum monthly recruitment, also grouped by specified fields", function() {
               
//                 return testProcessingFunction({
//                     table: data.recruitmentTable,
//                     query: {
//                         select: ["SUM(MonthRecruitment)", "Month", "StudyID"],
//                         where: [
//                             Fusion.between("Month", startDate, endDate),
//                             Fusion.in("StudyID", studyIDs)
//                         ],
//                         groupBy: ["Month", "StudyID"]
//                     },
//                     fn: data.monthlyRecruitment(startDate, endDate, ["StudyID"]),
//                     inputValues: studyIDRows
//                 });
//           });
//         });
                
//         describe("when grouping not specified", function(){
//           it("should return sum monthly recruitment, also grouped by specified fields", function() {
               
//                 return testProcessingFunction({
//                     table: data.recruitmentTable,
//                     query: {
//                         select: ["SUM(MonthRecruitment)", "Month"],
//                         where: [
//                             Fusion.between("Month", startDate, endDate),
//                             Fusion.in("StudyID", _.values(studyIDs))
//                         ],
//                         groupBy: ["Month"]
//                     },
//                     fn: data.monthlyRecruitment(startDate, endDate),
//                     inputValues: studyIDRows
//                 });
//           });
//         });
//     });
    
//     describe("runningTotal", function() {
//         it("should accumulate count over date, when other rows are identical", function() {
//             return testProcessingFunction({
//                 fn: data.runningTotal("count", "date"),
//                 inputValues: [
//                     {a: 1, b: 2, date: new Date(1, 2, 3), count: 5},
//                     {a: 1, b: 2, date: new Date(1, 3, 3), count: 7}, 
//                     {a: 1, b: 3, date: new Date(1, 3, 3), count: 4}, 
//                     {a: 1, b: 3, date: new Date(1, 5, 3), count: 20}
//                 ],
//                 values: [
//                     {a: 1, b: 2, date: new Date(1, 2, 3), count: 5},
//                     {a: 1, b: 2, date: new Date(1, 3, 3), count: 12}, 
//                     {a: 1, b: 3, date: new Date(1, 3, 3), count: 4}, 
//                     {a: 1, b: 3, date: new Date(1, 5, 3), count: 24}
//                 ],
//                 ignoreOrdering: true
//             });
//         });
        
//         it("should handle duplicates gracefully", function() {
//             return testProcessingFunction({
//                 fn: data.runningTotal("count", "date"),
//                 inputValues: [
//                     {a: 1, b: 2, date: new Date(1, 2, 3), count: 5},
//                     {a: 1, b: 2, date: new Date(1, 2, 3), count: 5},
//                     {a: 1, b: 2, date: new Date(1, 3, 3), count: 7}, 
//                     {a: 1, b: 2, date: new Date(1, 3, 3), count: 4}, 
//                     {a: 1, b: 2, date: new Date(1, 5, 3), count: 20}
//                 ],
//                 values: [
//                     {a: 1, b: 2, date: new Date(1, 2, 3), count: 5},
//                     {a: 1, b: 2, date: new Date(1, 2, 3), count: 5},
//                     {a: 1, b: 2, date: new Date(1, 3, 3), count: 12}, 
//                     {a: 1, b: 2, date: new Date(1, 3, 3), count: 4}, 
//                     {a: 1, b: 2, date: new Date(1, 5, 3), count: 24}
//                 ],
//                 ignoreOrdering: true
//             });
//         });
        
//         it("should compose operations", function() {
//             var op1 = function(){ return Promise.resolve(2) };
//             var op2 = function(x){ return Promise.resolve(x * 5) };
            
//             return DataSource.compose(op1, op2)()
//                 .then(function(x){
//                     expect(x).to.eql(10);
//                 });
//         });
        
//         it("should do operations", function(done) {
//             DataSource.do({
//                 operation: function(){ return Promise.resolve(1); },
//                 onCompleted: function(x){ 
//                     expect(x).to.eql(1);
//                     done();
//                 }
//             });
//         });
//     });
// });
