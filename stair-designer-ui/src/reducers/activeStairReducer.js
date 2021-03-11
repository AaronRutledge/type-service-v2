import { UPDATE_CURRENT_STAIRWELL, GET_STAIRWELL, GET_FLOOR_LEVELS, TOGGLE_STAIR_REFLOW_FLAG, GET_FLOOR_PLANS } from '../actions/actionTypes';


const activeStairReducer = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_CURRENT_STAIRWELL:
            return Object.assign({}, state, action.stairwell)
        case GET_STAIRWELL:
            const currentUiBrowserState = window.UiBrowserState ? JSON.parse(window.UiBrowserState.state) : null;
            if (!currentUiBrowserState) return state;
            let stairwell = currentUiBrowserState.stairwells.find(stair => stair.stairName === action.stairName);
            stairwell.currentStep = 1;
            stairwell.isEditing = true;
            return Object.assign({}, state, stairwell)
        case GET_FLOOR_LEVELS:
            const floorLevels = window.UiBrowserState ? JSON.parse(window.UiBrowserState.levels) : null
            if (!floorLevels) return state;
            return Object.assign({}, state, { floorLevels });
        case GET_FLOOR_PLANS:
            const planLevels = window.UiBrowserState ? JSON.parse(window.UiBrowserState.planLevels) : null
            if (!planLevels) return state;
            return Object.assign({}, state, { planLevels });
        case TOGGLE_STAIR_REFLOW_FLAG:
            return Object.assign({}, state, action.needsReflowed)
        default:
            return state
    }
}

export default activeStairReducer