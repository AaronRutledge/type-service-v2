import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateCurrentStairwell, getFloorLevels, getFloorPlans } from '../actions/stairsActions';
import {getProjectGuid} from '../actions/projectActions';
import { InputNumber, Input, Button, Table, Row, Spin, Card, Steps } from 'antd';
import ReviewFlights from './ReviewFlights';
import { parse } from '../Util/parse';
import { format } from '../Util/format';
import _sortBy from 'lodash/sortBy';
import CollectTopData from './CollectTopData';
import CollectFloorLevelData from './CollectFloorLevelData';
import { calculateFlightsFromStories, calculateStairDimensionsWithDogLegs, calculateStairDimensionsFromFlightElevations, calculateStoryFlights, resequenceFlights, checkFlightGeometry, handleExcessLandingWidths } from '../Util/stairCalcs';
import PlaceStair from './PlaceStair';

class StairwellLayoutContainer extends Component {
  constructor(props) {
    super(props);
    this.handleStairValueUpdate = this.handleStairValueUpdate.bind(this);
    this.handleStoryEnter = this.handleStoryEnter.bind(this);
    this.handleFlightsTableInputChange = this.handleFlightsTableInputChange.bind(this);
    this.handleTableInputChange = this.handleTableInputChange.bind(this);
    this.calculateStairDims = this.calculateStairDims.bind(this);
    this.calculateFlightDims = this.calculateFlightDims.bind(this);
    this.handleStairInputChange = this.handleStairInputChange.bind(this);
    this.handleStepClick = this.handleStepClick.bind(this);
    this.handleWindowClose = this.handleWindowClose.bind(this);
    this.handleStairDirectionCheck = this.handleStairDirectionCheck.bind(this);
    this.addStory = this.addStory.bind(this);
    this.handleAddStoryToggle = this.handleAddStoryToggle.bind(this);
    this.handleLevelSelectionUpdate = this.handleLevelSelectionUpdate.bind(this);
    this.handleElevationChange = this.handleElevationChange.bind(this);
    this.handleChangeStoryFlightCount = this.handleChangeStoryFlightCount.bind(this);
    this.handleLandingElevationDeltaChange = this.handleLandingElevationDeltaChange.bind(this);
    this.checkFlighGeometry = this.checkFlighGeometry.bind(this);

  }
  componentDidMount() {
    // this allow some time for the levels to be loaded onto the window element before loading into state
    setTimeout(() => {
      this.props.getFloorLevels();
      this.props.getFloorPlans();
      this.props.getProjectGuid();
    }, 100);
  }

  checkFlighGeometry() {
    const invalidFlights = checkFlightGeometry(this.props.activeStair.flights, this.props.activeStair)
    if (invalidFlights.length > 0) console.log("yo!  bad bad bad" + JSON.stringify(invalidFlights));
  }

  handleLandingElevationDeltaChange(storyId, delta) {
    //>will need to recalculate the current story and the one below if it one exists
    //>calcaulate currentstory height
    //>elevation of level above current story - current story elevation
    //>adjust for deltas:  subtract height calcualction by sum of detlas from current story (delta passed to func) and one above it (if it exists)

    //>recalcaulte story below if it exists
    //>calculate story below height
    //>height of story below is equal to current story elevation minus elevation below
    //>adjust fro deltas:  subtract height calculation by sum of deltas from current story and one below it.

    //>remove the flights belonging to the the two stories in copy of state
    //>merge in recalcualted flightsd

    const stories = this.props.activeStair.stories.sort((a, b) => parse.F(a.elevation) - parse.F(b.elevation)).slice();
    const storyIndex = this.props.activeStair.stories.findIndex(story => story.storyId === storyId);
    const currentStory = stories[storyIndex];
    currentStory.landingElevationDelta = delta;

    let storyHeight = (storyIndex < stories.length - 1) ? parse.F(stories[storyIndex + 1].elevation) * 12 - parse.F(stories[storyIndex].elevation) * 12 : 0;
    const elevationDelta = (storyIndex < stories.length - 1) ? parse.F(delta) * 12 - parse.F(stories[storyIndex + 1].landingElevationDelta) * 12 : 0;

    storyHeight = storyHeight - elevationDelta;

    const existingStoryFlights = this.props.activeStair.flights.filter(x => x.story === storyId);
    const startingFlightId = Math.min(...existingStoryFlights.map(x => x.flightId));
    const updatedStoryFlights = calculateStoryFlights(currentStory, storyHeight, startingFlightId, this.props.activeStair);

    let adjacentUpdatedStoryFlights;
    //only if not bottom
    if (storyId !== 1) {
      const adjacentStory = stories[storyIndex - 1]
      let adjacentStoryHeight = ((storyIndex < stories.length - 1) ? parse.F(stories[storyIndex].elevation) * 12 - parse.F(adjacentStory.elevation) * 12 : 0);
      const existingAdjacentStoryFlights = this.props.activeStair.flights.filter(x => x.story === (storyId - 1));
      const adjacentStartingFlightId = Math.min(...existingAdjacentStoryFlights.map(x => x.flightId));
      const adjacentElevationDelta = (storyIndex < stories.length - 1) ? parse.F(delta) * 12 - parse.F(stories[storyIndex - 1].landingElevationDelta) * 12 : 0;
      adjacentStoryHeight = adjacentStoryHeight + adjacentElevationDelta;
      adjacentUpdatedStoryFlights = calculateStoryFlights(adjacentStory, adjacentStoryHeight, adjacentStartingFlightId, this.props.activeStair);
    }
    let updatedFlights = [...this.props.activeStair.flights.filter(x => x.story !== storyId), ...updatedStoryFlights];

    if (storyId !== 1) updatedFlights = [...updatedFlights.filter(x => x.story !== (storyId - 1)), ...adjacentUpdatedStoryFlights];

    //const updatedStair = { ...this.props.activeStair, flights: calculateStairDimensionsWithDogLegs(resequenceFlights(updatedFlights), this.props.activeStair) };
    this.calculateFlightDims(calculateStairDimensionsWithDogLegs(resequenceFlights(updatedFlights), this.props.activeStair));

    //this.props.updateCurrentStairwell(updatedStair);
  }

  handleChangeStoryFlightCount(storyId, flightCount) {

    const stories = this.props.activeStair.stories.sort((a, b) => parse.F(a.elevation) - parse.F(b.elevation)).slice();
    const storyIndex = this.props.activeStair.stories.findIndex(story => story.storyId === storyId);

    let updatedStory = { ...stories[storyIndex] };
    updatedStory.flights = flightCount;
    let storyHeight = (storyIndex < stories.length - 1) ? parse.F(stories[storyIndex + 1].elevation) * 12 - parse.F(updatedStory.elevation) * 12 : 0;

    const elevationDelta = (storyIndex < stories.length - 1) ? (parse.F(stories[storyIndex].landingElevationDelta)) * 12 - (parse.F(stories[storyIndex + 1].landingElevationDelta)) * 12 : 0;
    storyHeight = storyHeight - elevationDelta;

    stories.splice(storyIndex, 1);
    const updatedStories = [...stories, updatedStory];
    const existingStoryFlights = this.props.activeStair.flights.filter(x => x.story === storyId);
    const startingFlightId = Math.min(...existingStoryFlights.map(x => x.flightId), 0);
    // TODO:  All flight ids will need to be resequenced when adding flights
    const updatedStoryFlights = calculateStoryFlights(updatedStory, storyHeight, startingFlightId, this.props.activeStair);
    let updatedFlights = [...this.props.activeStair.flights.filter(x => x.story !== storyId), ...updatedStoryFlights];
    const updatedStair = { ...this.props.activeStair, stories: updatedStories }
    this.calculateFlightDims(calculateStairDimensionsWithDogLegs(resequenceFlights(updatedFlights), updatedStair), updatedStair);
  }

  handleElevationChange(flightId, newElevation, isTop) {
    //TODO ensure flight id is in the correct order when adding new flights.  They will need to be recalculated above where they are inserted.
    //
    let sortedFlights = Object.assign([], this.props.activeStair.flights)
      .sort((a, b) => a.flightId - b.flightId);

    const flightIndex = sortedFlights.findIndex(x => x.flightId === flightId);
    // if changing the top, the bottom should be anchor and vice versa
    const adjacentFlightIndex = flightIndex + (isTop ? 1 : -1);
    const flightField = isTop ? "topElevation" : "bottomElevation";
    const adjacentFlightField = isTop ? "bottomElevation" : "topElevation";
    sortedFlights[flightIndex][flightField] = newElevation;
    sortedFlights[adjacentFlightIndex][adjacentFlightField] = newElevation;
    this.props.updateCurrentStairwell({ ...this.props.activeStair, flights: sortedFlights });
  }

  addStory() {
    const fracFormatter = (value) => format.FT.to.FT.IN.FRAC(32)(value);
    const id = Math.max(...this.props.activeStair.stories.map(o => o.storyId), 0) + 1;
    // find top floor and add flights to it
    const topFloor = this.props.activeStair.stories
      .filter(story => parse.F(story.elevation) ===
        Math.max(...this.props.activeStair.stories.map(o => parse.F(o.elevation), 0)
        ))
    [0];

    const updatedItem = { ...topFloor, flights: 2 };

    const updatedStories = Object.assign([],
      //TODO: Make new story height user configurable.  Best handling is to force blur to input and make user set it.
      //TODO:  Also need to only update sort onblur so row doesn't move on user
      [...this.props.activeStair.stories, { storyId: id, storyName: `Added Level ${id}`, elevation: fracFormatter(parse.F(topFloor.elevation) + 12), flights: 0 }],
      { [this.props.activeStair.stories.findIndex(x => x.storyId === topFloor.storyId)]: updatedItem },
    );

    this.props.updateCurrentStairwell({
      ...this.props.activeStair,
      stories: updatedStories,
      addingStory: !this.props.activeStair.addingStory
    });
  }

  handleAddStoryToggle() {
    this.props.updateCurrentStairwell({ ...this.props.activeStair, addingStory: !this.props.activeStair.addingStory });
  }

  handleStairDirectionCheck(e) {
    const updatedStair = { ...this.props.activeStair, isClockwise: !e.target.checked }
    this.props.updateCurrentStairwell(updatedStair);
  }

  handleStepClick(step) {
    const updatedStair = { ...this.props.activeStair, currentStep: step }
    this.props.updateCurrentStairwell(updatedStair);
  }

  handleWindowClose() {
    if (window.UiBrowserState) {
      window.UiBrowserState.state = JSON.stringify(this.props.activeStair);
      window.UiBrowserState.closeWindow();
    }
  }
  handleFlightsTableInputChange(value, record, field) {


    const updatedItem = { ...record, [field]: value };

    if (field === "dogLegLength") {
      updatedItem.isDogLeg = (value > 0) ? true : false;
    }
    const updatedFlights = Object.assign([],
      this.props.activeStair.flights,
      { [this.props.activeStair.flights.findIndex(x => x.flightId === record.flightId)]: updatedItem }
    );
    const updatedStair = { ...this.props.activeStair, flights: updatedFlights }
    this.props.updateCurrentStairwell(updatedStair);
  }

  handleTableInputChange(value, record, field) {
    const formValue = (field === "flights") ? value : value.target.value;
    const updatedItem = { ...record, [field]: formValue };
    const updatedStories = Object.assign([],
      this.props.activeStair.stories,
      { [this.props.activeStair.stories.findIndex(x => x.storyId === record.storyId)]: updatedItem }
    );
    this.calculateStairDims(updatedStories)
    // let updatedStair = { ...this.props.activeStair, stories: updatedStories }

    //   // TODO:  Create function for just this story
    //   calculateStairDims
    //   const updatedFlights = calculateFlightsFromStories(updatedStories, updatedStair);

    //   updatedStair = { ...updatedStair, flights: updatedFlights }


    // this.props.updateCurrentStairwell(updatedStair);
  }

  // handles updates to top and bottom level selections.  Adds levels to landingLevels
  handleLevelSelectionUpdate(key, value) {
    console.log(`key is ${key} and value is ${value}`)
    if ((key === "topLevelId" && this.props.activeStair.bottomLevelId) || (key === "bottomLevelId" && this.props.activeStair.topLevelId)) {
      const floorLevelsFilteredBySelections = this.props.activeStair.floorLevels.slice(
        this.props.activeStair.floorLevels.findIndex(x => x.id === (key === "bottomLevelId" ? value : this.props.activeStair.bottomLevelId)),
        this.props.activeStair.floorLevels.findIndex(x => x.id === (key === "topLevelId" ? value : this.props.activeStair.topLevelId)) + 1
      ).map(level => (level.id));
      this.props.updateCurrentStairwell({ ...this.props.activeStair, landingsLevels: floorLevelsFilteredBySelections, [key]: value });
    } else {
      const updatedStair = { ...this.props.activeStair, [key]: value };
      this.props.updateCurrentStairwell(updatedStair);
    }
  }


  handleStairValueUpdate(key, value) {
    const updatedStair = { ...this.props.activeStair, [key]: value };
    this.props.updateCurrentStairwell(updatedStair);
  }

  handleStairInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const updatedStair = { ...this.props.activeStair, [name]: value };
    this.props.updateCurrentStairwell(updatedStair);
  }

  handleStoryEnter() {
    let updatedStair;
    const fracFormatter = (value) => format.FT.to.FT.IN.FRAC(32)(value);
    // TODO: this eventually becomes default handling
    if (this.props.activeStair.storiesDefinedBy === "import") {
      if (!window.UiBrowserState) {
        //TODO:  Add better error messaging
        alert('Levels not detected.  Please enter manually')
        return;
      }
      //sort by elevation from lowest to highest
      const floorLevels = this.props.activeStair.floorLevels.filter(level => this.props.activeStair.landingsLevels.includes(level.id));
      let sortedLevels = Object.assign([], floorLevels)
        .sort((a, b) => parseFloat(a.elevation) - parseFloat(b.elevation));

      sortedLevels = sortedLevels.slice(
        sortedLevels.findIndex(x => x.id == this.props.activeStair.bottomLevelId),
        sortedLevels.findIndex(x => x.id == this.props.activeStair.topLevelId) + 1
      );

      const selectedLevels = sortedLevels.map((level, i) => ({
        storyId: i + 1,
        modelLevelId: level.id,
        storyName: level.levelName,
        //storyHeight: (i === sortedLevels.length - 1) ? 0: sortedLevels[i+1].elevation - level.elevation,
        elevation: fracFormatter(level.elevation),
        flights: (i === sortedLevels.length - 1) ? 0 : Math.ceil((sortedLevels[i + 1].elevation - level.elevation) / parse.F(this.props.activeStair.maxFlightRise)),
        landingElevationDelta: this.props.activeStair.landingElevationDelta
      }));

      updatedStair = { ...this.props.activeStair, stories: selectedLevels, currentStep: 1 };

    } else {
      let stories = [];
      for (let i = 0; i < this.props.activeStair.storyCount; i++) {
        const isTop = this.props.activeStair.storyCount === i + 1;
        const elevation = i === 0 ? 0 : parse.F(stories[i - 1].elevation) + parse.F(this.props.activeStair.defaultStoryHeight);
        stories.push({
          storyId: i + 1,
          storyName: `Level ${i + 1}`,
          modelLevelId: null,
          elevation: fracFormatter(elevation),
          flights: isTop ? 0 : 2,
          landingElevationDelta: this.props.activeStair.landingElevationDelta
        })
      };

      updatedStair = { ...this.props.activeStair, stories, currentStep: 1 };
    }

    this.props.updateCurrentStairwell(updatedStair);
    this.calculateStairDims(updatedStair.stories);
    //
  }

  calculateStairDims(stories) {


    let flights = calculateFlightsFromStories(stories, this.props.activeStair);
    flights = calculateStairDimensionsWithDogLegs(flights, this.props.activeStair);
    const maxRunLength = Math.max(...flights.map(x => x.runLength), 0);
    const stairLength = maxRunLength + 2 * parse.F(this.props.activeStair.stairWidth)*12;

    let updatedStair = {
      ...this.props.activeStair,
      flights,
      stories,
      stairLength,
      stairwellWidth: parse.F(this.props.activeStair.stairwellWidthF)*12,
      currentStep: 1
    };
    if (this.props.activeStair.stairwellLengthHandling === "predetermined") {
      updatedStair = {
        ...updatedStair,
        stairLength: parse.F(this.props.activeStair.predeterminedStairwellLength) * 12,
        stairwellWidth: parse.F(this.props.activeStair.stairwellWidthF)*12,
        flights: handleExcessLandingWidths(updatedStair)
      };
    }
    this.props.updateCurrentStairwell(updatedStair);
  }

  calculateFlightDims(flights, stair = this.props.activeStair) {

    //TODO:  Make safe copy...
    flights = calculateStairDimensionsFromFlightElevations(flights, stair);

    const maxRunLength = Math.max(...flights.map(x => x.runLength), 0);
    const stairLength = maxRunLength + 2 * parse.F(this.props.activeStair.stairWidth)*12;

    let updatedStair = {
      ...stair,
      flights,
      stairLength,
      currentStep: 1
    };
    if (this.props.activeStair.stairwellLengthHandling === "predetermined") {
      updatedStair = {
        ...updatedStair,
        stairLength: parse.F(this.props.activeStair.predeterminedStairwellLength) * 12,
        flights: handleExcessLandingWidths(updatedStair)
      };
    }
    this.props.updateCurrentStairwell(updatedStair);
  }

  render() {
    console.log('state: ' + JSON.stringify(this.props.activeStair))

    const collectTopData =
      <CollectTopData
        handleStairInputChange={this.handleStairInputChange}
        activeStair={this.props.activeStair}
        handleStairValueUpdate={this.handleStairValueUpdate}
        handleStairDirectionCheck={this.handleStairDirectionCheck}
        handleStoryEnter={this.handleStoryEnter}
        handleLevelSelectionUpdate={this.handleLevelSelectionUpdate}
      />

    const collectFloorData =
      <CollectFloorLevelData
        activeStair={this.props.activeStair}
        //handleTableInputChange={this.handleTableInputChange}
        handleStepClick={() => this.handleStepClick(2)}
        //calculateStairDims={() => this.calculateFlightDims(this.props.activeStair.flights)}
        addStory={this.addStory}
        handleAddStoryToggle={this.handleAddStoryToggle}
        handleElevationChange={this.handleElevationChange}
        handleChangeStoryFlightCount={this.handleChangeStoryFlightCount}
        handleLandingElevationDeltaChange={this.handleLandingElevationDeltaChange}
      //checkFlighGeometry={this.checkFlighGeometry}

      />

    const collectFlightData =
      <ReviewFlights
        handleStairValueUpdate={this.handleStairValueUpdate}
        activeStair={this.props.activeStair}
        handleFlightsTableInputChange={this.handleFlightsTableInputChange}
        handleUpdate={() => this.handleStepClick(3)}
      //handleUpdate={() => this.calculateFlightDims(this.props.activeStair.flights)}
      />


    const placeStair = <PlaceStair
      activeStair={this.props.activeStair}
      handleStairValueUpdate={this.handleStairValueUpdate}
      handleWindowClose={this.handleWindowClose} />

    const renderCurrentStep = () => {
      switch (this.props.activeStair.currentStep) {
        case 0: return collectTopData;
        case 1: return collectFloorData;
        case 2: return collectFlightData;
        case 3: return placeStair;
        default: return placeStair;
      }
    }


    //calcStairDims();

    return (

      <Row>

        <Card title="Stairwell Geometry" style={{ margin: 20 }} extra={<a onClick={this.props.toggleDrawer}>Project Details</a>}>
          <Steps current={this.props.activeStair.currentStep}>
            <Steps.Step key={1} title={"Top Level Data"} onClick={() => this.handleStepClick(0)} />
            <Steps.Step key={2} title={"Elevations"} onClick={() => this.handleStepClick(1)} />
            <Steps.Step key={3} title={"Review/Edit Flights"} onClick={() => this.handleStepClick(2)} />
            <Steps.Step key={4} title={"Place Stair"} onClick={() => this.handleStepClick(3)} />
          </Steps>
          {renderCurrentStep()}
        </Card>

      </Row>

    );
  }
}
const mapStateToProps = (state) => ({
  activeStair: state.activeStair
});
const mapDispatchToProps = (dispatch) => ({
  updateCurrentStairwell: (stair) => dispatch(updateCurrentStairwell(stair)),
  getFloorLevels: () => dispatch(getFloorLevels()),
  getFloorPlans: () => dispatch(getFloorPlans()),
  getProjectGuid: () => dispatch(getProjectGuid())
});

export default connect(mapStateToProps, mapDispatchToProps)(StairwellLayoutContainer)
