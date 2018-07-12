import {handleActions} from 'redux-actions';
import {
  UPDATE_SCREEN_SIZE,
  FETCH_BAYESIAN_NETWORK_START,
  UPDATE_BAYESIAN_NETWORK,
  UPDATE_MODEL_LIST
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

const handleFecthBayesianNetworkStart = (state, {payload}) => ({
  ...state,
  isFetchingData: true
});

const handleUpdateBayesianNetwork = (state, {payload}) => ({
  ...state,
  data: payload,
  isFetchingData: false
});

const handleUpdateModelList = state => ({
  ...state
});

export default handleActions(
  {
    [UPDATE_SCREEN_SIZE]: handleUpdateScreenSize,
    [FETCH_BAYESIAN_NETWORK_START]: handleFecthBayesianNetworkStart,
    [UPDATE_BAYESIAN_NETWORK]: handleUpdateBayesianNetwork,
    [UPDATE_MODEL_LIST]: handleUpdateModelList
  },
  DEFAULT_STATE
);
