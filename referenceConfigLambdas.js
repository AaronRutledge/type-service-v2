//Flight selector
function out(config, positionType) { return config.flights[positionType - 1] }

function out(config, positionType) {
    var configObj = config.flights.reverse();
    return configObj[positionType - 1];
}

//Stairwell Assembly Flight Location
function out(config, sketch, positionType) {
    return { distance: 0, delete: typeof config.flights[positionType - 1] === 'undefined' }
}


//guardrail bolts left
function out(config, sketch, positionType) {
    if (config.isClockwise && config.interiorRailType == "guardrail") return 1;
    if (!config.isClockwise && config.exterioirRailType == "guardrail") return 1;
    return 0;
}

//guardrail bolts right
function out(config, sketch, positionType) {
    if (config.isClockwise && config.exterioirRailType == "guardrail") return 1;
    if (!config.isClockwise && config.interiorRailType == "guardrail") return 1;
    return 0;
}



//Fram rail.  Guardrail bolts right.  This is for the inside position.  Eventuially need to out one fo the outside.
function out(config, sketch, locationType) { return config.isClockwise ? 0 : 1 }

//StairRailLayout IsTopDogLeg abd HasPostSetBack
function out(config, sketch, locationType) { return config.isDogLeg ? 1 : 0 }

//Stringer bolt hole distance
function out(config, sketch, locationType) { return (sketch.IsTopDogLeg == 1) ? sketch.railBoltHoleDistanceWithSetBack : sketch.railBoltHoleDistanceRegular }

//StairRailLayout TopPanSheetMetalThickness
function out(config, sketch, locationType) { return config.dogLegLength > 11 ? .1875 : .078 }

//FrameRailAssembly BarLength TopPost
function out(config, sketch, locationType) { return config.isDogLeg ? sketch.frTopPostDlLength : sketch.frTopPostNoDlLength }

//FrameRailAssembly, TopRail FarLMAngle
function out(config, sketch, locationType) { return config.isDogLeg ? sketch.frTopRailDlTopMitre : sketch.frTopRailNoDlTopMitre }

//Frame rail dl items
function out(config, sketch, positionType) { return { distance: 0, delete: (sketch.IsTopDogLeg !== 1) } }

//Frame rail Rise to accomodate ddl
function out(config, sketch, locationType) { return config.isDdl ? (config.riseHeight + config.riserHeight) : config.riseHeight }

//Frame rail Run to accomodate ddl
function out(config, sketch, locationType) { return config.isDdl ? (config.runLength + 11) : config.runLength }

function out(config, positionType) { return config.flights.find(obj => { return obj.flightId === positionType + 1 }) }

function out(config, positionType) { return config.flights.find(obj => { return obj.flightId === (parseInt(positionType) - 1) }) }

function out(config, positionType) {
    return config.flights.filter(function (obj) {
        return obj.flightId === parseInt(positionType) - 1;
    })[0];
}

function out(config, positionType) {
    var configObj = config;
    var outP = [];
    for (var i = 0; i < configObj.flights.length; i++) {
        outP.push(configObj.flights[i].flightId);
    }
    return outP;
}

function out(config, positionType) {
    var configObj = config;
    return configObj.flights[1];
}

//bridge
function out(config, sketch, positionType) {
    if (config.isBridge) return { distance: 0, delete: false };
    return { distance: 0, delete: true };
}


function out(config, sketch, positionType) {
    if (sketch.IsRightMountGuardrail == 0) {
        return { distance: 0, delete: false };
    } else {
        return { distance: 0, delete: true };
    }
}

function out(config, sketch, locationType) {
    if (config.isBottomStair) return sketch.adagrMainOffsetLength;
    if (config.isDdl) return sketch.grDlBottomOffsetLength;
    return 0;
}
function out(config, sketch, locationType) {
    if (config.isDdl) return 1;
    if (config.isBottomStair) return 1;
    return 0;
}

function out(config, sketch, positionType) {
    if (sketch.IsDdl == 1) return { distance: 0, delete: true };
    if (config.isBottomStair) return { distance: 0, delete: true };
    return { distance: 0, delete: false };
}

function out(config, sketch, positionType) {
    if (sketch.IsDdl == 1) return { distance: 0, delete: true };
    if (config.isBottomStair) return { distance: 0, delete: true };
    return { distance: 0, delete: false };
}

function out(config, sketch, locationType) {
    if (config.isBridge) return config.runLength;
    if (config.hasLandingRail) return (parseFloat(config.stairWidth) + 1.5);
    return null;
}

function out(config, sketch, positionType) {
    if (config.hasLandingRail) return { distance: 0, delete: false };
    if (config.isBridge) return { distance: 0, delete: false };
    return { distance: 0, delete: true }
}

function out(config, sketch, locationType) {
    if (config.isTopStair) return 0;
    return 1;
}


function out(config, sketch, positionType) {
    if (sketch.ledgerAngleMaxSpacing < 60) return { distance: 0, delete: true };
    return { distance: 0, delete: false }
}

function out(config, sketch, locationType) { return sketch.ledgerAngleMaxSpacing > 60 ? 3 : 2 }

function out(config, sketch, positionType) {
    if (config.landingHasLeftStandPipePenetration) return { distance: 0, delete: false };
    return { distance: 0, delete: true }
}

function out(config, sketch, positionType) {
    if (config.landingHasLeftStandPipePenetration) return { distance: 0, delete: false };
    if (config.landingHasRightStandPipePenetration) return { distance: 0, delete: true };
    return { distance: 0, delete: false }
}


function out(config, sketch, positionType) {
    if ((config.landingWidth - 1.75) > 85) return 4;
    return 3
}

function out(config, sketch, locationType) { return config.landingWidth + 6 }

function out(config, sketch, positionType) {
    if (sketch.HasGrabrail == 1) return { distance: 0, delete: false };
    return { distance: 0, delete: true }
}

function out(config, sketch, positionType) {
    if (sketch.HasGrabrail == 1) return { distance: 0, delete: false };
    return { distance: 0, delete: true }
}

function out(config, sketch, positionType) {
    if (positionType === "SAFETYGATE") return { distance: 0, delete: true };
    return { distance: 0, delete: false }
}

function out(config, sketch, positionType) {
    if (positionType === "SAFETYGATE") return { distance: 0, delete: true };
    return { distance: 0, delete: false }
}

function out(config, sketch, locationType) { 
    if (sketch.IsSafetyGate == 1) return parseFloat(sketch.postLength)-11.72;
    return sketch.postLength
}

function out(config, sketch, assemblyParams, locationType) { 
    if (assemblyParams.IsSafetyGate==1) return 11.72;
    return 0;
}

//update landiong anglecrossmemeber LegLength:
SkecthL CrossMemberAngleLegLength
//uipdate bottom post offset on h
function out(config, sketch, assemblyParams, locationType) { 
    if (config.hasSafetyGate) return 11.72;
    return 0;
}


