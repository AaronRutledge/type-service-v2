import {combineReducers} from 'redux';
import activeStair from './activeStairReducer';
import project from './projectReducer';

export default combineReducers({
    activeStair,
    project
})