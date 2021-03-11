import {UPDATE_PROJECT, GET_PROJECT, GET_PROJECT_GUID} from './actionTypes';

export const updateProject = project => ({
    type: UPDATE_PROJECT,
    project
})

export const getProject = () => ({
    type: GET_PROJECT
})

export const getProjectGuid = () => ({
    type: GET_PROJECT_GUID
})
