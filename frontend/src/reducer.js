import {handleActions} from 'redux-actions';
import {
  UPDATE_SCREEN_SIZE,
  UPDATE_CURRENT_DATASET_NAME,
  UPDATE_DATASET_LIST,
  FETCH_BAYESIAN_NETWORK_START,
  UPDATE_BAYESIAN_NETWORK,
  UPDATE_MODEL_LIST,
  UPDATE_SELECTED_MODEL,
  UPDATE_NODE_LINK_VIEW_OPTIONS,
  UPDATE_HIERARCHICAL_CLUSTERING_TREE,
  UPDATE_DISTANCE_MAP,
  UPDATE_HIERARCHICAL_CLUSTERING_CUT_THRESHOLD,
  UPDATE_FEATURE_SELECTION
} from './actions';

const DEFAULT_STATE = {
  screenWidth: 0,
  screenHeight: 0,
  isFetchingData: false,
  currentDatasetName: null, // the current dataset name
  datasetList: [], // the names of all the available datasets
  // the raw Bayesian Network data:
  // [
  //  {
  //  source: (the source name),
  //  target: (the target name),
  //  weight: (the edge weight)
  //  },
  //  ...]
  bayesianNetwork: [],
  // the raw hierarchical clustering tree:
  // {
  //  id,
  //  name: (name of the node, only defined in leaf nodes),
  //  count: (number of descendends of the node),
  //  dist: (the max distance of pairs within the cluster node),
  //  children: [...]
  //  }
  hierarchicalClusteringTree: null,
  hierarchicalClusteringCutThreshold: 1,
  // the raw distance map:
  // {'id1-id2': (dist), ...} -- id1 < id2
  distanceMap: {},
  // the raw feature selection list:
  // null -- select all features
  // [] -- select no features
  // [name, ...] -- select the features by name
  featureSelection: null,
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
  bayesianNetwork: payload,
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

const handleUpdateHierarchicalClusteringTree = (state, {payload}) => ({
  ...state,
  hierarchicalClusteringTree: payload
});

const handleUpdateDistanceMap = (state, {payload}) => ({
  ...state,
  distanceMap: payload
});

const handleUpdateHierarchicalClusteringCutThreshold = (state, {payload}) => ({
  ...state,
  hierarchicalClusteringCutThreshold: payload
});

const handleUpdateFeatureSelection = (state, {payload}) => ({
  ...state,
  featureSelection: payload
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
    [UPDATE_NODE_LINK_VIEW_OPTIONS]: handleUpdateNodeLinkViewOptions,
    [UPDATE_HIERARCHICAL_CLUSTERING_TREE]: handleUpdateHierarchicalClusteringTree,
    [UPDATE_DISTANCE_MAP]: handleUpdateDistanceMap,
    [UPDATE_HIERARCHICAL_CLUSTERING_CUT_THRESHOLD]: handleUpdateHierarchicalClusteringCutThreshold,
    [UPDATE_FEATURE_SELECTION]: handleUpdateFeatureSelection
  },
  DEFAULT_STATE
);
