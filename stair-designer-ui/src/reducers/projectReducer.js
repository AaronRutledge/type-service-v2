import { UPDATE_PROJECT, GET_PROJECT, GET_PROJECT_GUID } from '../actions/actionTypes';


const projectReducer = (state = {}, action) => {

    switch (action.type) {
        case UPDATE_PROJECT:
            return Object.assign({}, state, action.project)
        case GET_PROJECT:
            const currentUiBrowserState = window.UiBrowserState ? JSON.parse(window.UiBrowserState.state) : null;
            if (!currentUiBrowserState) return state;
            return Object.assign({}, state, currentUiBrowserState)
        case GET_PROJECT_GUID:
            const projectGuid = window.UiBrowserState ? window.UiBrowserState.projectGuid : null;
            if (!projectGuid) return state;
            return Object.assign({}, state, {projectGuid})
        default:
            return state
    }
}

export default projectReducer