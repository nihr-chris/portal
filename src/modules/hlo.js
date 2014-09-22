var DataSource = require("./datasource.js");

var HLO1 = function(startDate, endDate) {
    var data = DataSource.main();
    var studies = data.getNonCommercialStudies();
    
    var byTrust = studies
        .monthlyRecruitment({
            forEach: ["TrustID"],
            from: startDate, 
            to: endDate, 
        })
        .withNameOfTrust({
            fromField: "TrustID",
            inField: "What"
        });
    
    var crnWide = studies
        .monthlyRecruitment({
            from: startDate, 
            to: endDate
        })
        .with({
            value: "Network-Wide",
            inField: "What"
        });
        
    return byTrust.mergedWith(crnWide)
        .justFields([
            "What", "MonthRecruitment"
        ])
        .withRunningTotal({
            inField: "CumulativeRecruitment",
            summingField: "MonthRecruitment",
            overField: "Month"
        });
};

var HLO2b = function(params) {
    var data = DataSource.main();
    
    return data.timeTargetStudySelection({
            commercial: params.commercial,
            closed: params.closedStudies,
            from: params.startDate,
            to: params.endDate
        })
        .withTotalRecruitment({
            from: params.startDate,
            to: params.endDate
        })
        .withTimeTargetRAGRating({
            closedStudies: params.closedStudies,
            inField: "RAG Rating"
        })
        .withCount({
            ofFieldValues: "RAG Rating",
            inFields: {
                "Red":   "Red Count",
                "Amber": "Amber Count",
                "Green": "Green Count"
            }
        })
        .withNameOfTrust({
            fromField: "TrustID",
            inField: "Trust"
        });
        .justFields([
            "Red Count", "Amber Count", "Green Count",
        ])
};
