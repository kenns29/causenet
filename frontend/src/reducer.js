import {handleActions} from 'redux-actions';
import {
  UPDATE_SCREEN_SIZE,
  UPDATE_NAV_PANEL_WIDTH,
  UPDATE_CONTENT_PANEL_CENTER,
  UPDATE_SHOW_BAYESIAN_NETWORK_DISTRIBUTION_WINDOW,
  UPDATE_BAYESIAN_NETWORK_DISTRIBUTION_WINDOW_SIZE,
  UPDATE_SHOW_FEATURE_DISTRIBUTION_WINDOW,
  UPDATE_FEATURE_DISTRIBUTION_WINDOW_SIZE,
  UPDATE_SHOW_BAYESIAN_NETWORK_SUB_NETWORK_DETAIL_WINDOW,
  UPDATE_CURRENT_DATASET_NAME,
  UPDATE_DATASET_LIST,
  FETCH_BAYESIAN_NETWORK_START,
  FETCH_MODIFIED_BAYESIAN_NETWORK_START,
  UPDATE_BAYESIAN_NETWORK,
  UPDATE_MODIFIED_BAYSIAN_NETWORK,
  UPDATE_CLUSTER_BAYESIAN_NETWORK,
  UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURES,
  UPDATE_CLUSTER_BAYESIAN_NETWORK_FOCUS,
  UPDATE_SUB_BAYESIAN_NETWORK_MAP,
  UPDATE_SUB_BAYESIAN_MODEL_FEATURES_MAP,
  UPDATE_SUB_BAYESIAN_NETWORK_SLICE_MAP,
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
  UPDATE_FEATURE_VALUES_MAP,
  UPDATE_DISTRIBUTION_FEATURE_PAIRS,
  UPDATE_SELECTED_NORMALIZED_FEATURE_DISTRIBUTION_MAP,
  UPDATE_SELECTED_SUB_BAYESIAN_NETWORK_ID
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
  // The complete list of features of the selected cluster bayesian model
  clusterBayesianModelFeatures: [],
  // The cluster bayesian network focus
  // null -- no focus,
  // id -- id of the node to focus on, the network will be filtered to contain
  //       only the paths that go through the node
  // [id1, id2] -- the network will contain only that path segments that connects id1 and id2
  clusterBayesianNetworkFocus: null,
  // the sub Bayesian Network within the clusters, omits one item clusters
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
  subBayesianNetworkMap: {},
  // the sub Bayesian Network features, omits one item clusters
  // {
  //  cluster_id: [
  //    feature_name,
  //    ...
  //  ],
  // ...}
  subBayesianModelFeaturesMap: {},
  // the sub Bayesian Network link slices for filtering the links of overly
  // large sub networks. If a slice for a cluster_id is not specified, a default
  // behavior is supposed to be applied.
  // {
  //  cluster_id: [slice_start, slice_end],
  //  ...
  // }
  subBayesianNetworkSliceMap: {},
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
  // list of assigned values:
  // {feature_name: [value_name, ...], ...}
  featureValuesMap: {},
  selectedModel: null,
  modelList: [],
  nodeLinkViewOptions: {
    showLabels: false,
    useHierarchy: true
  },
  showFeatureDistributionWindow: true,
  featureDistributionWindowSize: [600, 620],
  showBayesianNetworkDistributionWindow: true,
  bayesianNetworkDistributionWindowSize: [600, 620],
  // feature pair list that will be shown in the distribution window
  // [
  //  {
  //    id: (pair id),
  //    source: (source id),
  //    target: (target id)
  //  },
  //  ...
  // ]
  distributionFeaturePairs: [],
  // selected normalized feature distribution map
  // {
  //  feature_id : {
  //    value_key : (value),
  //    ...
  //  },
  //  ...
  // }
  selectedNormalizedFeatureDistributionMap: {},
  showBayesianNetworkSubNetworkDetailWindow: false,
  selectedSubBayesianNetworkId: null
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

const handleUpdateShowBayesianNetworkDistributionWindow = (
  state,
  {payload}
) => ({
  ...state,
  showBayesianNetworkDistributionWindow: payload
});

const handleUpdateBayesianNetworkDistributionWindowSize = (
  state,
  {payload}
) => ({
  ...state,
  bayesianNetworkDistributionWindowSize: payload
});

const handleUpdateShowFeatureDistributionWindow = (state, {payload}) => ({
  ...state,
  showFeatureDistributionWindow: payload
});

const handleUpdateFeatureDistributionWindowSize = (state, {payload}) => ({
  ...state,
  featureDistributionWindowSize: payload
});

const handleUpdateShowBayesianNetworkSubNetworkDetailWindow = (
  state,
  {payload}
) => ({
  ...state,
  showBayesianNetworkSubNetworkDetailWindow: payload
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

const handleUpdateClusterBayesianModelFeatures = (state, {payload}) => ({
  ...state,
  clusterBayesianModelFeatures: payload
});

const handleUpdateClusterBayesianNetworkFocus = (state, {payload}) => ({
  ...state,
  clusterBayesianNetworkFocus: payload
});

const handleUpdateSubBayesianNetworkMap = (state, {payload}) => ({
  ...state,
  subBayesianNetworkMap: payload
});

const handleUpdateSubBayesianModelFeaturesMap = (state, {payload}) => ({
  ...state,
  subBayesianModelFeaturesMap: payload
});

const handleUpdateSubBayesianNetworkSliceMap = (state, {payload}) => ({
  ...state,
  subBayesianNetworkSliceMap: payload
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

const handleUpdateDistributionFeaturePairs = (state, {payload}) => ({
  ...state,
  distributionFeaturePairs: payload
});

const handleUpdateSelectedNormalizedFeatureDistributionMap = (
  state,
  {payload}
) => ({
  ...state,
  selectedNormalizedFeatureDistributionMap: payload
});

const handleUpdateSelectedSubBayesianNetworkId = (state, {payload}) => ({
  ...state,
  selectedSubBayesianNetworkId: payload
});

export default handleActions(
  {
    [UPDATE_SCREEN_SIZE]: handleUpdateScreenSize,
    [UPDATE_NAV_PANEL_WIDTH]: handleUpdateNavPanelWidth,
    [UPDATE_CONTENT_PANEL_CENTER]: handleUpdateContentPanelCenter,
    [UPDATE_SHOW_BAYESIAN_NETWORK_DISTRIBUTION_WINDOW]: handleUpdateShowBayesianNetworkDistributionWindow,
    [UPDATE_BAYESIAN_NETWORK_DISTRIBUTION_WINDOW_SIZE]: handleUpdateBayesianNetworkDistributionWindowSize,
    [UPDATE_SHOW_FEATURE_DISTRIBUTION_WINDOW]: handleUpdateShowFeatureDistributionWindow,
    [UPDATE_FEATURE_DISTRIBUTION_WINDOW_SIZE]: handleUpdateFeatureDistributionWindowSize,
    [UPDATE_SHOW_BAYESIAN_NETWORK_SUB_NETWORK_DETAIL_WINDOW]: handleUpdateShowBayesianNetworkSubNetworkDetailWindow,
    [UPDATE_CURRENT_DATASET_NAME]: handleUpdateCurrentDatasetName,
    [UPDATE_DATASET_LIST]: handleUpdateDatasetList,
    [FETCH_BAYESIAN_NETWORK_START]: handleFetchBayesianNetworkStart,
    [FETCH_MODIFIED_BAYESIAN_NETWORK_START]: handleFetchModifiedBayesianNetworkStart,
    [UPDATE_BAYESIAN_NETWORK]: handleUpdateBayesianNetwork,
    [UPDATE_MODIFIED_BAYSIAN_NETWORK]: handleUpdateModifiedBayesianNetwork,
    [UPDATE_BAYESIAN_MODEL_FEATURES]: handleUpdateBayesianModelFeatures,
    [UPDATE_CLUSTER_BAYESIAN_NETWORK]: handleUpdateClusterBayesianNetwork,
    [UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURES]: handleUpdateClusterBayesianModelFeatures,
    [UPDATE_CLUSTER_BAYESIAN_NETWORK_FOCUS]: handleUpdateClusterBayesianNetworkFocus,
    [UPDATE_SUB_BAYESIAN_NETWORK_MAP]: handleUpdateSubBayesianNetworkMap,
    [UPDATE_SUB_BAYESIAN_MODEL_FEATURES_MAP]: handleUpdateSubBayesianModelFeaturesMap,
    [UPDATE_SUB_BAYESIAN_NETWORK_SLICE_MAP]: handleUpdateSubBayesianNetworkSliceMap,
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
    [UPDATE_FEATURE_VALUES_MAP]: handleUpdateFeatureValuesMap,
    [UPDATE_DISTRIBUTION_FEATURE_PAIRS]: handleUpdateDistributionFeaturePairs,
    [UPDATE_SELECTED_NORMALIZED_FEATURE_DISTRIBUTION_MAP]: handleUpdateSelectedNormalizedFeatureDistributionMap,
    [UPDATE_SELECTED_SUB_BAYESIAN_NETWORK_ID]: handleUpdateSelectedSubBayesianNetworkId
  },
  DEFAULT_STATE
);
