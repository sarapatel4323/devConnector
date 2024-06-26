import { GET_ERRORS , CLEAR_ERROR } from '../actions/types';

const intialState = {
  isAuthenticated: false,
  user: {}
};

export default function combineReducer(state = intialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload;
    case CLEAR_ERROR:
      return {}; 
    default:
      return state;
  }
}