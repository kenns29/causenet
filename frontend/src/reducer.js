import {handleActions} from 'redux-actions';
import {
  UPDATE_SCREEN_SIZE,
  FETCH_DATA_START,
  FETCH_DATA_SUCCESS
} from './actions';

const DEFAULT_STATE = {
  screenWidth: 0,
  screenHeight: 0,
  isFetchingData: false,
  data: []
};

const handleUpdateScreenSize = (state, {payload}) => ({
  ...state,
  screenWidth: payload.width,
  screenHeight: payload.height
});

const handleFecthDataStart = (state, {payload}) => ({
  ...state,
  isFetchingData: true
});

const handleFecthDataSuccess = (state, {payload}) => ({
  ...state,
  data: payload,
  isFetchingData: false
});

export default handleActions(
  {
    [UPDATE_SCREEN_SIZE]: handleUpdateScreenSize,
    [FETCH_DATA_START]: handleFecthDataStart,
    [FETCH_DATA_SUCCESS]: handleFecthDataSuccess
  },
  DEFAULT_STATE
);
