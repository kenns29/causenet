import {handleActions} from 'redux-actions';
import {
  UPDATE_SCREEN_SIZE,
  UPDATE_CURRENT_DATASET_NAME,
  UPDATE_DATASET_LIST,
  FETCH_BAYESIAN_NETWORK_START,
  UPDATE_BAYESIAN_NETWORK,
  UPDATE_MODEL_LIST,
  UPDATE_SELECTED_MODEL,
  UPDATE_NODE_LINK_VIEW_OPTIONS
} from './actions';

const DEFAULT_STATE = {
  screenWidth: 0,
  screenHeight: 0,
  isFetchingData: false,
  currentDatasetName: null,
  datasetList: [],
  data: [],
  selectedModel: null,
  modelList: [],
  nodeLinkViewOptions: {
    showLabels: false
  }
};

const handleUpdateScreenSize = (state, {payload}) => ({
  ...state,
  screenWidth: payload.width,
  screenHeight: payload.height
});

const handleUpdateCurrentDatasetName = (state, {payload}) => ({
  ...state,
  currentDatasetName: payload
});

const handleUpdateDatasetList = (state, {payload}) => ({
  ...state,
  datasetList: payload
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

const handleUpdateModelList = (state, {payload}) => ({
  ...state,
  modelList: payload
});

const handleUpdateSelectedModel = (state, {payload}) => ({
  ...state,
  selectedModel: payload
});

const handleUpdateNodeLinkViewOptions = (state, {payload}) => ({
  ...state,
  nodeLinkViewOptions: {
    ...state.nodeLinkViewOptions,
    ...payload
  }
});

export default handleActions(
  {
    [UPDATE_SCREEN_SIZE]: handleUpdateScreenSize,
    [UPDATE_CURRENT_DATASET_NAME]: handleUpdateCurrentDatasetName,
    [UPDATE_DATASET_LIST]: handleUpdateDatasetList,
    [FETCH_BAYESIAN_NETWORK_START]: handleFecthBayesianNetworkStart,
    [UPDATE_BAYESIAN_NETWORK]: handleUpdateBayesianNetwork,
    [UPDATE_MODEL_LIST]: handleUpdateModelList,
    [UPDATE_SELECTED_MODEL]: handleUpdateSelectedModel,
    [UPDATE_NODE_LINK_VIEW_OPTIONS]: handleUpdateNodeLinkViewOptions
  },
  DEFAULT_STATE
);
