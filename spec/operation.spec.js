var expect          = require('chai').expect;
var describe        = global.describe, it = global.it, beforeEach = global.beforeEach;

var _               = require("underscore");
var Promise         = require("promise");
var moment          = require("moment");

var DataSource      = require("../src/modules/datasource.js");
var Fusion          = require("../src/modules/fusion.js");
var Operation       = require("../src/modules/operation.js");
var mocks           = require("./mocks.js");
var expectOperation = require("./operation.helpers.js").expectOperation;


describe("any Operation", function(){
    var data = mocks.dataSource();
    
    var rootOperation;
    
    beforeEach(function(){
        rootOperation = new Operation({
            dataSource: data,
            outputColumns: ["A", "B"],
            promise: Promise.resolve("result")
        });
    });
    
    describe("a root operation", function() {
        it("should vend the DataSource", function() {
            expect(rootOperation.dataSource).to.equal(data);
        });
        it("should vend the outputColumns", function() {
            expect(rootOperation.outputColumns).to.eql(["A", "B"]);
        });
        
        it("should resolve to value", function(done) {
            rootOperation.onCompleted(function(x) {
                expect(x).to.eql("result");
                done();
            });
        });
    });
    
    it("should throw error when creating child operation that requires columns not returned by parent", function() {
        expect(function() {
            rootOperation.childOperation({
                inputColumns: ["C"],
                outputColumns: ["B"],
                transform: function(){}
            });
        }).to.throw(Error);
    });
    
    describe("a child operation", function() {
        var childOperation;
        
        beforeEach(function(){
            childOperation = rootOperation.childOperation({
                inputColumns: ["A"],
                outputColumns: ["B"],
                transform: function(x){
                    return x.toUpperCase();
                }
            });
        });
        
        it("should vend the DataSource", function() {
            expect(childOperation.dataSource).to.equal(data);
        });
        
        it("should resolve to value", function(done) {
            childOperation.onCompleted(function(x) {
                expect(x).to.eql("RESULT");
                done();
            });
        });
    });
    
    describe("module", function() {
        var parent, child;
        
        beforeEach(function() {
            var Parent = Operation.module({
                operations: {
                    inherited: function() {
                        return this.childOperation({
                            inputColumns: [],
                            outputColumns: [],
                            transform: function() {
                                return "inherited!";
                            }
                        });
                    }
                }
            });
            var Imported = Parent.module({
                operations: {
                    imported: function() {
                        return this.childOperation({
                            inputColumns: [],
                            outputColumns: [],
                            transform: function() {
                                return "imported!";
                            }
                        });
                    }
                }
            });
            var Child = Parent.module({
                imports: [Imported],
                operations: {
                    defined: function() {
                        return this.childOperation({
                            inputColumns: [],
                            outputColumns: [],
                            transform: function() {
                                return "defined!";
                            }
                        });
                    }
                }
            });
            
            parent = mocks.rootOperation([], Parent);
            child = mocks.rootOperation([], Child);
        });
        
        it("child should inherit the parent module's operations", function() {
            return child.inherited().onCompleted(function(val) {
                expect(val).to.eql("inherited!");
            });
        });
        
        it("child should add its own operations", function() {
            return child.defined().onCompleted(function(val) {
                expect(val).to.eql("defined!");
            });
        });
        
        it("child should add an imported module's operations", function() {
            return child.imported().onCompleted(function(val) {
                expect(val).to.eql("imported!");
            });
        });
        
        it("should raise an error for name clash in imported modules", function() {
            var A = Operation.module({
                operations: {
                    defined: function() {
                        return this.childOperation({
                            inputColumns: [],
                            outputColumns: [],
                            transform: function() {
                                return "defined!";
                            }
                        });
                    }
                }
            });
            var B = Operation.module({
                operations: {
                    defined: function() {
                        return this.childOperation({
                            inputColumns: [],
                            outputColumns: [],
                            transform: function() {
                                return "defined!";
                            }
                        });
                    }
                }
            });
            
            expect(function() {
                Operation.module({
                    imports: [A, B]
                });
            }).to.throw(Error);
        });
        
        it("should not raise an error for module imported twice", function() {
            var A = Operation.module({
                operations: {
                    defined: function() {
                        return this.childOperation({
                            inputColumns: [],
                            outputColumns: [],
                            transform: function() {
                                return "defined!";
                            }
                        });
                    }
                }
            });
            
            expect(function() {
                Operation.module({
                    imports: [A, A]
                });
            }).to.not.throw(Error);
        });
    });
});

describe("Common Operation", function() {
    var startDate = new Date(2011, 1, 2);
    var endDate = new Date(2011, 3, 2);
    
    var HLOStudyFields = ["StudyID", "TrustID", "FullTitle", "Banding", "ActualStartDate", "ExpectedEndDate", "ActualEndDate"];
        
    describe("getHLO1Studies", function() {
        it("should fetch studies", function() {
            return expectOperation(function(parent) {
                return parent.getHLO1Studies({
                    startDate: startDate,
                    endDate: endDate
                });
            })
            .toMakeQuery({
                select: ["StudyID"],
                where: [
                    Fusion.lt("ActualStartDate", endDate),
                    Fusion.or(Fusion.eql("ActualEndDate", null), Fusion.gte("ActualEndDate", startDate))
                ],
                groupBy: ["StudyID"]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
    });
        
    describe("getHLO2Studies", function() {
        it("should fetch HLO2a(closed) query", function() {
            return expectOperation(function(parent){
                return parent.getHLO2Studies({
                    startDate: startDate,
                    endDate: endDate,
                    commercial: true,
                    closed: true
                });
            })
            .toMakeQuery({
                select: HLOStudyFields,
                where: [
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-04-01")),
                    Fusion.eql("Commercial", 1),
                    Fusion.notIn("RecruitmentInformationStatus", ["No NHS Support", "Sample Data: No Consent Requested"]),
                    Fusion.in("ActiveStatus", ["Closed - in follow-up", "Closed - follow-up complete"]),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.between("ActualEndDate", startDate, endDate)
                ]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
        
        it("should fetch HLO2a(open) query", function() {
            return expectOperation(function(parent){
                return parent.getHLO2Studies({
                    startDate: startDate,
                    endDate: endDate,
                    commercial: true,
                    closed: false
                });
            })
            .toMakeQuery({
                select: HLOStudyFields,
                where: [
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-04-01")),
                    Fusion.eql("Commercial", 1),
                    Fusion.notIn("RecruitmentInformationStatus", ["No NHS Support", "Sample Data: No Consent Requested"]),
                    Fusion.eql("ActiveStatus", "Open"),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.gte("ActualStartDate", new Date("2010-04-01"))
                ]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
        
        it("should fetch HLO2b query", function() {
            return expectOperation(function(parent){
                return parent.getHLO2Studies({
                    startDate: startDate,
                    endDate: endDate,
                    commercial: false,
                    closed: true
                });
            })
            .toMakeQuery({
                select: HLOStudyFields,
                where: [
                    Fusion.gte("PortfolioQualificationDate", new Date("2010-04-01")),
                    Fusion.eql("Commercial", 0),
                    Fusion.notIn("RecruitmentInformationStatus", ["No NHS Support", "Sample Data: No Consent Requested"]),
                    Fusion.in("ActiveStatus", ["Closed - in follow-up", "Closed - follow-up complete"]),
                    Fusion.eql("ProjectStatus", "Blue"),
                    Fusion.between("ActualEndDate", startDate, endDate)
                ]
            })
            .onTable("studyTable")
            .andReturnQueryResults();
        });
    });
    
    describe("monthlyRecruitment", function() {
        describe("when forEach is specified", function(){
            it("should fetch total monthly recruitment, grouped by specified fields", function() {
                return expectOperation(function(parent){
                    return parent.monthlyRecruitment({
                        forEach: ["StudyID"],
                        from: startDate,
                        until: endDate
                    });
                })
                .withInput([{StudyID: 1}, {StudyID: 2}])
                .toMakeQuery({
                    select: ["SUM(MonthRecruitment) AS RecruitmentCount", "Month", "StudyID"],
                    where: [
                        Fusion.between("Month", startDate, endDate),
                        Fusion.in("StudyID", [1,2])
                    ],
                    groupBy: ["Month", "StudyID"],
                })
                .onTable("recruitmentTable")
                .andReturnQueryResults();
            });
        });
          
        describe("when forEach is not specified", function(){
            it("should fetch network-wide total monthly recruitment", function() {
                return expectOperation(function(parent){
                    return parent.monthlyRecruitment({
                        from: startDate,
                        until: endDate
                    });
                })
                .withInput([{StudyID: 1}, {StudyID: 2}])
                .toMakeQuery({
                    select: ["SUM(MonthRecruitment) AS RecruitmentCount", "Month"],
                    where: [
                        Fusion.between("Month", startDate, endDate),
                        Fusion.in("StudyID", [1,2])
                    ],
                    groupBy: ["Month"],
                })
                .onTable("recruitmentTable")
                .andReturnQueryResults();
            });
        });
     });
     
     describe("withValues", function() {
        it("should add literal values", function() {
            return expectOperation(function(parent){
                return parent.withValues({
                    myField: "myValue"
                });
            })
            .withInput([{StudyID: 1}, {StudyID: 2}])
            .toReturn([
                {StudyID: 1, myField: "myValue"}, 
                {StudyID: 2, myField: "myValue"}
            ]);
        });
     });
     
     describe("withFieldValues", function() {
         it("should add field values", function() {
            return expectOperation(function(parent){
                return parent.withFieldValues({
                    b: "a"
                });
            })
            .withInput([{a: 1}, {a: 2}])
            .toReturn([
                {a: 1, b: 1}, 
                {a: 2, b: 2}
            ]);
         });
     });
     
     describe("withTrustName", function() {
         it("should add trust name", function() {
            return expectOperation(function(parent){
                return parent.withTrustName({
                    trustName: "trustID"
                });
            })
            .withInput([{trustID: 1}, {trustID: 2}])
            .toReturn([
                {trustID: 1, trustName: "Org1"}, 
                {trustID: 2, trustName: "Org2"}
            ]);
         });
     });
     
     describe("withFY", function() {
         it("should add financial year", function() {
            return expectOperation(function(parent){
                return parent.withFY({
                    fy: "date"
                });
            })
            .withInput([
                {date: new Date("2011-4-1")}, 
                {date: new Date("2011-3-1")}
            ])
            .toReturn([
                {date: new Date("2011-4-1"), fy: 2011}, 
                {date: new Date("2011-3-1"), fy: 2010}
            ]);
         });
     });
     
     describe("accumulate", function() {
         it("should accumulate over fields in order provided", function() {
            return expectOperation(function(parent){
                return parent.accumulate({
                    field: "count",
                    inField: "runningTotal",
                    overFields: ["a", "b"]
                });
            })
            .withInput([
                {a: 1, b: 2, count: 30},
                {a: 1, b: 2, count: 40},
                {a: 1, b: 1, count: 10},
                {a: 1, b: 1, count: 20},
            ])
            .toReturn([
                {a: 1, b: 2, count: 30, runningTotal: 30},
                {a: 1, b: 2, count: 40, runningTotal: 70},
                {a: 1, b: 1, count: 10, runningTotal: 10},
                {a: 1, b: 1, count: 20, runningTotal: 30},
            ]);
         });
     });
     
     describe("union", function() {
         it("should return union of operation result", function() {
            var otherOperation = mocks.rootOperation([
                {id: 3},
                {id: 4},
            ]);
             
            return expectOperation(function(parent){
                return parent.union(otherOperation);
            })
            .withInput([
                {id: 1},
                {id: 2}
            ])
            .toReturn([
                {id: 1},
                {id: 2},
                {id: 3},
                {id: 4}
            ]);
         });
     });
     
     describe("justFields", function() {
         it("should drop all unspecified fields", function() {
            return expectOperation(function(parent){
                return parent.justFields(["a", "b"]);
            })
            .withInput([{a: 1, b: 2, c: 3}, {a: 11, b: 12, c: 13}])
            .toReturn([{a: 1, b: 2}, {a: 11, b: 12}]);
         });
     });
     
     describe("groupByOperation", function() {
        it("should group and summarize", function() {
            return expectOperation(function(parent){
                return parent.summarizeOperation({
                    groupBy: ["a", "b"],
                    summarize: function(rows, summary) {
                        summary["first"] = rows[0]["c"];
                    },
                    summarizeColumns: ["c"],
                    addedColumns: ["first"]
                });
            })
            .withInput([{a: 1, b: 2, c: 3}, {a: 1, b: 2, c: 4}, {a: 11, b: 12, c: 13}])
            .toReturn([{a: 1, b: 2, first: 3}, {a: 11, b: 12, first: 13}]);
        });
        
        it("should fail if group has variation within unsummarized column", function() {
            return expectOperation(function(parent){
                return parent.summarizeOperation({
                    groupBy: ["a", "b"],
                    summarize: function(rows, summary) {
                        summary["first"] = rows[0]["c"];
                    },
                    summarizeColumns: ["c"],
                    addedColumns: ["first"]
                });
            })
            .withInput([{a: 1, b: 2, c: 3, d: 1}, {a: 1, b: 2, c: 4, d: 2}, {a: 11, b: 12, c: 13, d: 1}])
            .toFailWithError("ambiguous value");
        });
    });
     
    describe("sum", function() {
        it("should group with sum", function() {
            return expectOperation(function(parent) {
                return parent.sum({
                    valuesFromField: "val",
                    inField: "total",
                    groupBy: ["a", "b"]
                });
            })
            .withInput([
                {a: 1, b: 2, c:0, val: 1}, 
                {a: 1, b: 2, c:0, val: 2},
                
                {a: 2, b: 2, c:0, val: 3},
                {a: 2, b: 2, c:0, val: 4}
            ])
            .toReturn([
                {a: 1, b: 2, c:0, total: 3},
                {a: 2, b: 2, c:0, total: 7}
            ]);
        });
    });
     
    describe("count", function() {
        it("should group with count", function() {
            return expectOperation(function(parent) {
                return parent.count({
                    valuesFromField: "colour",
                    inFields: {
                        "blue": "blueCount",
                        "green": "greenCount"
                    },
                    groupBy: ["a", "b"]
                });
            })
            .withInput([
                {a: 1, b: 2, c:0, colour: "blue"}, 
                {a: 1, b: 2, c:0, colour: "green"},
                
                {a: 2, b: 2, c:0, colour: "blue"},
                {a: 2, b: 2, c:0, colour: "blue"}
            ])
            .toReturn([
                {a: 1, b: 2, c:0, blueCount: 1, greenCount: 1},
                {a: 2, b: 2, c:0, blueCount: 2, greenCount: 0}
            ]);
        });
         
         it("should fail for unexpected counted value", function() {
            return expectOperation(function(parent) {
                 return parent.count({
                    valuesFromField: "colour",
                    inFields: {
                        "blue": "blueCount"
                    },
                    groupBy: ["a", "b"]
                });
            })
            .withInput([
                {a: 1, b: 2, colour: "blue"}, 
                {a: 1, b: 2, colour: "green"}
            ])
            .toFailWithError("Unexpected value");
        });
    });
    
    describe("withDurations", function() {
        it("should calculate specified durations", function() {
            return expectOperation(function(parent) {
                return parent.withDurations([
                    {between: "start", and: "end", in: "numDays"}
                ]);
            })
            .withInput([
                {start: new Date("2011-1-1"), end: new Date("2011-1-5")}
            ])
            .toReturn([
                {start: new Date("2011-1-1"), end: new Date("2011-1-5"), numDays: 4}
            ]);
        });
    });
    
    describe("withTimeTargetRatings", function() {
        it("should add ratings for open studies", function() {
            return expectOperation(function(parent) {
                return parent.withTimeTargetRatings({
                    partiallyCompleted: true,
                    from: {
                        expectedDays: "expDays",
                        actualDays: "actDays",
                        expectedRecruitment: "expRec",
                        actualRecruitment: "actRec"
                    },
                    in: {
                        percentCompleted: "time",
                        targetScore: "target",
                        combinedScore: "combined",
                        rating: "rag"
                    }
                });
            })
            .withInput([
                {id: "LongRed",         expDays: 100, actDays: 100, expRec: 100, actRec: 69},
                {id: "LongAmber-Low",   expDays: 100, actDays: 100, expRec: 100, actRec: 70},
                {id: "LongAmber-High",  expDays: 100, actDays: 100, expRec: 100, actRec: 99},
                {id: "LongGreen",       expDays: 100, actDays: 100, expRec: 100, actRec: 100},
                
                {id: "ShortRed",        expDays: 100, actDays: 50, expRec: 200, actRec: 69},
                {id: "ShortAmber-Low",  expDays: 100, actDays: 50, expRec: 200, actRec: 70},
                {id: "ShortAmber-High", expDays: 100, actDays: 50, expRec: 200, actRec: 99},
                {id: "ShortGreen",      expDays: 100, actDays: 50, expRec: 200, actRec: 100}
            ])
            .toReturn([
                {id: "LongRed",         expDays: 100, actDays: 100, expRec: 100, actRec: 69,
                                        time: 1, target: 0.69, combined: 0.69, rag: "Red"},
                {id: "LongAmber-Low",   expDays: 100, actDays: 100, expRec: 100, actRec: 70,
                                        time: 1, target: 0.7, combined: 0.7, rag: "Amber"},
                {id: "LongAmber-High",  expDays: 100, actDays: 100, expRec: 100, actRec: 99,
                                        time: 1, target: 0.99, combined: 0.99, rag: "Amber"},
                {id: "LongGreen",       expDays: 100, actDays: 100, expRec: 100, actRec: 100,
                                        time: 1, target: 1, combined: 1, rag: "Green"},
                
                {id: "ShortRed",        expDays: 100, actDays: 50, expRec: 200, actRec: 69,
                                        time: 0.5, target: 0.345, combined: 0.69, rag: "Red"},
                {id: "ShortAmber-Low",  expDays: 100, actDays: 50, expRec: 200, actRec: 70,
                                        time: 0.5, target: 0.35, combined: 0.7, rag: "Amber"},
                {id: "ShortAmber-High", expDays: 100, actDays: 50, expRec: 200, actRec: 99,
                                        time: 0.5, target: 0.495, combined: 0.99, rag: "Amber"},
                {id: "ShortGreen",      expDays: 100, actDays: 50, expRec: 200, actRec: 100,
                                        time: 0.5, target: 0.5, combined: 1, rag: "Green"}
            ]);
        });
    });
});
