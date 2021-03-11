import {UPDATE_CURRENT_STAIRWELL, GET_STAIRWELL, GET_FLOOR_LEVELS, GET_FLOOR_PLANS, TOGGLE_STAIR_REFLOW_FLAG} from './actionTypes';

export const updateCurrentStairwell = stairwell => ({
    type: UPDATE_CURRENT_STAIRWELL,
    stairwell
});

// TODO:  Possibly send stair id.  However, stair name also has to be unique, so perhpas this should be the id.
export const getStairwell = stairName => ({
    type: GET_STAIRWELL,
    stairName
});

export const getFloorLevels = () => ({
    type: GET_FLOOR_LEVELS
});

export const getFloorPlans = () => ({
    type: GET_FLOOR_PLANS
});

export const toggleStairReflowFlag = reflowFlag => ({
    type: TOGGLE_STAIR_REFLOW_FLAG,
    needsReflowed : reflowFlag
});
