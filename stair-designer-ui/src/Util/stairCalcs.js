import _sortBy from 'lodash/sortBy';
import { parse } from '../Util/parse';
import { format } from '../Util/format';

// TODO:  We are only increasing odd and even landings.  Need to update to update on actual story levels when there could be 3 or more flights in a landing
export const handleExcessLandingWidths = (stair) => {

    let sortedFlights = Object.assign([], stair.flights)
        .sort((a, b) => a.topElevation - b.topElevation);

    const excessLandingDelta = parse.F(stair.predeterminedStairwellLength) * 12 - stair.stairLength;
    console.log('excess is ' + excessLandingDelta)
    for (let i = 0; i < sortedFlights.length; i++) {
        let flight = sortedFlights[i];
        switch (stair.stairwellExcessLengthHandling) {
            case "increaseMidStoryLandings":
                if (i % 2 == 0) {
                    flight.landingWidth = flight.landingWidth + excessLandingDelta;
                }
                break;
            case "increaseStoryLandings":
                if (!(i % 2 == 0)) {
                    flight.landingWidth = flight.landingWidth + excessLandingDelta;
                }
                break;
            case "equalIncreaseLandings": flight.landingWidth = flight.landingWidth + .5 * excessLandingDelta;
        }
    }
    return sortedFlights
}


export const resequenceFlights = (flights) => {
    let sortedFlights = Object.assign([], flights)
        .sort((a, b) => a.topElevation - b.topElevation);
    sortedFlights.map((x, index) => {
        x.flightId = index;
    });
    return sortedFlights;
}

export const checkFlightGeometry = (flights, stair) => {

    const sortedFlights = Object.assign([], flights)
        .sort((a, b) => a.topElevation - b.topElevation);
    let invalidFlights = [];
    sortedFlights.map((flight, index) => {
        if (flight.flightId === 0) {
            if (flight.runLength + flight.landingWidth + parse.F(stair.stairWidth) * 12 > stair.stairLength) invalidFlights.push(flight.flightId);
        }
        else {
            if (flight.runLength + flight.landingWidth + flights[index - 1].landingWidth > stair.stairLength) invalidFlights.push(flight.flightId);
        }
    })

    return invalidFlights;
}

export const calculateStoryFlights = (story, storyHeight, idStart, stair) => {
    let flights = [];
    let flightElevation = parse.F(story.elevation) + parse.F(story.landingElevationDelta);

    // calculate total story risers
    const storyRisers = Math.ceil(storyHeight / stair.minimumRiserHeight);
    const bottomRunRisers = Math.ceil(storyRisers / story.flights);
    const upperRunRisers = story.flights > 1 ? Math.ceil((storyRisers - bottomRunRisers) / (story.flights - 1)) : storyRisers - bottomRunRisers;
    const flightRiserHeight = storyHeight / (bottomRunRisers + upperRunRisers * (story.flights - 1));
    // if the number of risers/number of flights is odd, first flight will have an additional riser.  Otherwise, all are the same.
    // calculate riser heights
    // calculate run lengths
    // identify dog legs
    // console.log(`risers: ${storyRisers}, bottom run risers ${bottomRunRisers}, upper run risers ${upperRunRisers}`)

    for (let i = 0; i < story.flights; i++) {
        const risers = (i === 0) ? bottomRunRisers : upperRunRisers;
        const isDogLeg = (i !== 0) && !(storyRisers % 2 == 0);
        const dogLegLength = isDogLeg ? 11 : 0;
        const runLength = (risers - 1) * stair.treadWidth;
        flights.push({
            flightId: idStart,
            story: story.storyId,
            name: `story${story.storyId}-flight${(i + 1)}`,
            isClockwise: stair.isClockwise,
            isBottomStair: (idStart === 0),
            isTopStair: (i === story.flights - 1),
            risers,
            riserHeight: flightRiserHeight,
            riseHeight: risers * flightRiserHeight,
            runLength,
            isDogLeg,
            dogLegLength,
            //lengths of landings are 2* the stair width + 6" or the specified predetermined amount
            landingLength: stair.stairwellWidthHandling === "predetermined" ? parse.F(stair.stairwellWidthF) * 12 : (parse.F(stair.stairWidth) * 12) * 2 + 12,
            stairWidth: parse.F(stair.stairWidth) * 12,
            exteriorRailType: stair.exteriorRailType,
            interiorRailType: stair.interiorRailType,
            railingPanelType: stair.railingPanelType,
            //landingElevationDelta: stair.landingElevationDelta,
            // TODO:  Ensure landing elevation delta is not cumulative
            bottomElevation: flightElevation,
            //if this is the top flight of a story adjust for landingElevationDelta
            topElevation: flightElevation + ((risers * flightRiserHeight) / 12),// - (i === (story.flights - 1) ? parse.F(story.landingElevationDelta) : 0),
            //todo:  update add in app to look at the story object for this and remove it below
            landingElevationDelta: parse.F(story.landingElevationDelta),
            landingSupportType: (i === 0) ? stair.floorLevelLandingSupportType : stair.intermediateLandingSupportType,
            hasLanding: !(!stair.landingsAtFloorLevels && i === (story.flights - 1)),
            stairEdgeOffset: stair.stairEdgeOffset
        });
        flightElevation = flightElevation + ((risers * flightRiserHeight) / 12);
        idStart++;
    }

    return flights;
}


export const calculateFlightsFromStories = (stories, stair) => {
    let flights = [];
    let flightId = 0;
    //TODO: Add null protection
    _sortBy(stories, 'storyId').map((x, index) => {
        // calculate story height
        let storyHeight = (index < stories.length - 1) ? parse.F(stories[index + 1].elevation) * 12 - parse.F(stories[index].elevation) * 12 : 0;
        const elevationDelta = (index < stories.length - 1) ? parse.F(stories[index + 1].landingElevationDelta) * 12 - parse.F(stories[index].landingElevationDelta
        ) * 12 : 0;
        storyHeight = storyHeight - elevationDelta;
        let storyFlights = calculateStoryFlights(x, storyHeight, flightId, stair);
        flights = [...flights, ...storyFlights]
        flightId = flightId + storyFlights.length;
    })
    return flights;
};

const fixDoubleDogLegs = (flights) => {
    let sortedFlights = Object.assign([], flights)
        .sort((a, b) => a.topElevation - b.topElevation);
    sortedFlights.map((x, index) => {
        if (index !== 0 && index !== sortedFlights.length - 1) {
            const nextFlight = sortedFlights[index + 1];
            if (x.dogLegLength !== 0 && nextFlight.dogLegLength !== 0) {
                const difference = Math.min(x.dogLegLength, nextFlight.dogLegLength);
                //const difference = x.dogLegLength > nextFlight.dogLegLength ? x.dogLegLength - nextFlight.dogLegLength : nextFlight.dogLegLength -x.dogLegLength;
                const thisDogLeg = x.dogLegLength - difference;
                const nextDogLeg = nextFlight.dogLegLength - difference
                x.landingWidth = x.landingWidth + difference;
                x.dogLegLength = thisDogLeg;
                x.isDogLeg = thisDogLeg > 0;
                nextFlight.dogLegLength = nextDogLeg;
                nextFlight.isDogLeg = nextDogLeg > 0;
            }
        }
        // step 5:  todo: iterate from second stair up.  If the ascending and descending stairs both have dog legs, shorten them both by the shorter dog leg and extend landing by that amount
    });
    return sortedFlights;
}

export const calculateStairDimensionsWithDogLegs = (flights, stair) => {

    // using the minimum landing width and dogleg approach.
    // step 1: calculate all run lengths based on ladning elevations (use calculateStairDimensionsFromFlightElevations)
    // step 2:  find longest run and calculate stair width as 2Xstairwidth+longestRun.
    const maxRunLength = Math.max(...flights.map(x => x.runLength), 0);
    const stairWellLength = maxRunLength + 2 * parse.F(stair.stairWidth) * 12;
    //const maxFlightIndex = flights.findIndex(flights => flights.runLength === maxRunLength);
    let sortedFlights = Object.assign([], flights)
        .sort((a, b) => a.topElevation - b.topElevation);

    sortedFlights.map((x, index) => {
        x.landingWidth = parse.F(stair.stairWidth) * 12;
        // step 3: from bottom, first run is not a dog leg.
        if (index === 0) {
            x.isDogLeg = false;
            x.dogLegLength = 0;
        } else {
            // step 4: iterate from second stair up by adding dog legs to any excess over the 2Xminimum stair width - stair run
            const dogLegLength = stairWellLength - (2 * parse.F(stair.stairWidth) * 12 + x.runLength);
            x.dogLegLength = dogLegLength;
            x.isDogLeg = dogLegLength > 0;
        }
    })
    // step 5:  todo: iterate from second stair up.  If the ascending and descind stairs both have dog legs, shorten them both by the shorter dog leg and extend landing by that amount
    return fixDoubleDogLegs(sortedFlights);
};


// This is being used once flights are initially calculated
export const calculateStairDimensionsFromFlightElevations = (flights, stair) => {
    let sortedFlights = Object.assign([], flights)
        .sort((a, b) => a.topElevation - b.topElevation);

    sortedFlights.map((x, index) => {
        const flightHeight = 12 * x.topElevation - 12 * x.bottomElevation;
        const flightRisers = Math.ceil(flightHeight / stair.minimumRiserHeight);
        const flightRiserHeight = flightHeight / flightRisers;
        const runLength = (flightRisers - 1) * stair.treadWidth;
        x.risers = flightRisers;
        x.riserHeight = flightRiserHeight;
        x.riseHeight = flightRisers * flightRiserHeight;
        x.runLength = runLength;
        //updatedFlights.push(x);
    })
    return calculateStairDimensionsWithDogLegs(sortedFlights, stair);
}