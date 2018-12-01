import {handleActions} from 'redux-actions';
import {
  UPDATE_SCREEN_SIZE,
  UPDATE_NAV_PANEL_WIDTH,
  UPDATE_CONTENT_PANEL_CENTER,
  UPDATE_CURRENT_DATASET_NAME,
  UPDATE_DATASET_LIST,
  FETCH_BAYESIAN_NETWORK_START,
  FETCH_MODIFIED_BAYESIAN_NETWORK_START,
  UPDATE_BAYESIAN_NETWORK,
  UPDATE_MODIFIED_BAYSIAN_NETWORK,
  UPDATE_CLUSTER_BAYESIAN_NETWORK,
  UPDATE_SUB_BAYESIAN_NETWORKS,
  UPDATE_SUB_BAYESIAN_MODELS_FEATURES,
  UPDATE_BAYESIAN_MODEL_FEATURES,
  UPDATE_BAYESIAN_MODEL_FEATURE_VALUE_SELECTION_MAP,
  UPDATE_HIGHLIGHTED_BAYESIAN_NETWORK_EDGE,
  UPDATE_HIGHLIGHTED_BAYESIAN_MODEL_FEATURE,
  UPDATE_MODEL_LIST,
  UPDATE_SELECTED_MODEL,
  UPDATE_NODE_LINK_VIEW_OPTIONS,
  UPDATE_HIERARCHICAL_CLUSTERING_OPTION,
  UPDATE_HIERARCHICAL_CLUSTERING_TREE,
  UPDATE_DISTANCE_MAP,
  UPDATE_HIERARCHICAL_CLUSTERING_CUT_THRESHOLD,
  UPDATE_FEATURE_SELECTION,
  UPDATE_FEATURE_VALUES_MAP
} from './actions';

import {HIERARICAL_CLUSTERING_OPTION} from './constants';

const DEFAULT_STATE = {
  screenWidth: 0,
  screenHeight: 0,
  navPanelWidth: 500,
  contentPanelCenter: [0.5, 0.5],
  isFetchingBayesianNetwork: false,
  isFetchingModifiedBayesianNetwork: false,
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
  // The modified Bayesian network after some features are set to fixed values
  modifiedBayesianNetwork: [],
  // The complete list of features of the selected bayesian model
  bayesianModelFeatures: [],
  bayesianModelFeatureValueSelectionMap: {},
  // The highlighted edge in the Bayesian Network: null || {source, target, weight}
  highlightedBayesianNetworkEdge: null,
  // Controls the node link view, matrix view and the feature list
  highlightedBayesianModelFeature: null, // null || feature_name
  // the raw cluster Bayesian Network data:
  // [
  //  {
  //  source: (the source cluster id),
  //  target: (the target cluster id),
  //  weight: (the edge weight)
  //  },
  //  ...]
  clusterBayesianNetwork: [],
  // the sub Bayesian Network within the clusters:
  // {
  //  cluster_id: [
  //    {
  //      source: (the source name),
  //      target: (the target name),
  //      weight: (the edge weight)
  //    },
  //    ...
  //  ],
  // ...}
  subBayesianNetworks: {},
  // the sub Bayesian Network features:
  // {
  //  cluster_id: [
  //    feature_name,
  //    ...
  //  ],
  // ...}
  subBayesianModelsFeatures: {},
  // the hierarchical clustering option:
  // raw -- clustering for all features as is
  // base -- group the features by the base variable name, temporal features of
  //         with the save base variable are grouped in a list
  // base_avg -- group the features by the base variable name, temporal features of
  //         with the save base variable are grouped by sum
  hierarchicalClusteringOption: HIERARICAL_CLUSTERING_OPTION.RAW,
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
  // the feature value map maps each feature in the current data to its
  // list of values:
  // {feature_name: [value_name, ...], ...}
  featureValuesMap: {},
  selectedModel: null,
  modelList: [],
  nodeLinkViewOptions: {
    showLabels: false,
    useHierarchy: false
  }
};

const handleUpdateScreenSize = (state, {payload}) => ({
  ...state,
  screenWidth: payload.width,
  screenHeight: payload.height
});

const handleUpdateNavPanelWidth = (state, {payload}) => ({
  ...state,
  navPanelWidth: payload
});

const handleUpdateContentPanelCenter = (state, {payload}) => ({
  ...state,
  contentPanelCenter: payload
});

const handleUpdateCurrentDatasetName = (state, {payload}) => ({
  ...state,
  currentDatasetName: payload
});

const handleUpdateDatasetList = (state, {payload}) => ({
  ...state,
  datasetList: payload
});

const handleFetchBayesianNetworkStart = state => ({
  ...state,
  isFetchingBayesianNetwork: true
});

const handleFetchModifiedBayesianNetworkStart = state => ({
  ...state,
  isFetchingModifiedBayesianNetwork: true
});

const handleUpdateBayesianNetwork = (state, {payload}) => ({
  ...state,
  bayesianNetwork: payload,
  isFetchingBayesianNetwork: false
});

const handleUpdateModifiedBayesianNetwork = (state, {payload}) => ({
  ...state,
  modifiedBayesianNetwork: payload,
  isFetchingModifiedBayesianNetwork: false
});

const handleUpdateClusterBayesianNetwork = (state, {payload}) => ({
  ...state,
  clusterBayesianNetwork: payload
});

const handleUpdateSubBayesianNetworks = (state, {payload}) => ({
  ...state,
  subBayesianNetworks: payload
});

const handleUpdateSubBayesianModelsFeatures = (state, {payload}) => ({
  ...state,
  subBayesianModelsFeatures: payload
});

const handleUpdateBayesianModelFeatures = (state, {payload}) => ({
  ...state,
  bayesianModelFeatures: payload
});

const handleUpdateBayesianModelFeatureValueSelectionMap = (
  state,
  {payload}
) => ({
  ...state,
  bayesianModelFeatureValueSelectionMap: payload
});

const handleUpdateHighlightedBayesianNetworkEdge = (state, {payload}) => ({
  ...state,
  highlightedBayesianNetworkEdge: payload
});

const handleUpdateHighlightedBayesianModelFeature = (state, {payload}) => ({
  ...state,
  highlightedBayesianModelFeature: payload
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

const handleUpdateHierarchicalClusteringOption = (state, {payload}) => ({
  ...state,
  hierarchicalClusteringOption: payload
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

const handleUpdateFeatureValuesMap = (state, {payload}) => ({
  ...state,
  featureValuesMap: payload
});

export default handleActions(
  {
    [UPDATE_SCREEN_SIZE]: handleUpdateScreenSize,
    [UPDATE_NAV_PANEL_WIDTH]: handleUpdateNavPanelWidth,
    [UPDATE_CONTENT_PANEL_CENTER]: handleUpdateContentPanelCenter,
    [UPDATE_CURRENT_DATASET_NAME]: handleUpdateCurrentDatasetName,
    [UPDATE_DATASET_LIST]: handleUpdateDatasetList,
    [FETCH_BAYESIAN_NETWORK_START]: handleFetchBayesianNetworkStart,
    [FETCH_MODIFIED_BAYESIAN_NETWORK_START]: handleFetchModifiedBayesianNetworkStart,
    [UPDATE_BAYESIAN_NETWORK]: handleUpdateBayesianNetwork,
    [UPDATE_MODIFIED_BAYSIAN_NETWORK]: handleUpdateModifiedBayesianNetwork,
    [UPDATE_BAYESIAN_MODEL_FEATURES]: handleUpdateBayesianModelFeatures,
    [UPDATE_CLUSTER_BAYESIAN_NETWORK]: handleUpdateClusterBayesianNetwork,
    [UPDATE_SUB_BAYESIAN_NETWORKS]: handleUpdateSubBayesianNetworks,
    [UPDATE_SUB_BAYESIAN_MODELS_FEATURES]: handleUpdateSubBayesianModelsFeatures,
    [UPDATE_BAYESIAN_MODEL_FEATURE_VALUE_SELECTION_MAP]: handleUpdateBayesianModelFeatureValueSelectionMap,
    [UPDATE_HIGHLIGHTED_BAYESIAN_NETWORK_EDGE]: handleUpdateHighlightedBayesianNetworkEdge,
    [UPDATE_HIGHLIGHTED_BAYESIAN_MODEL_FEATURE]: handleUpdateHighlightedBayesianModelFeature,
    [UPDATE_MODEL_LIST]: handleUpdateModelList,
    [UPDATE_SELECTED_MODEL]: handleUpdateSelectedModel,
    [UPDATE_NODE_LINK_VIEW_OPTIONS]: handleUpdateNodeLinkViewOptions,
    [UPDATE_HIERARCHICAL_CLUSTERING_OPTION]: handleUpdateHierarchicalClusteringOption,
    [UPDATE_HIERARCHICAL_CLUSTERING_TREE]: handleUpdateHierarchicalClusteringTree,
    [UPDATE_DISTANCE_MAP]: handleUpdateDistanceMap,
    [UPDATE_HIERARCHICAL_CLUSTERING_CUT_THRESHOLD]: handleUpdateHierarchicalClusteringCutThreshold,
    [UPDATE_FEATURE_SELECTION]: handleUpdateFeatureSelection,
    [UPDATE_FEATURE_VALUES_MAP]: handleUpdateFeatureValuesMap
  },
  DEFAULT_STATE
);
