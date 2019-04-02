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
  UPDATE_SHOW_CR_MATRIX_WINDOW,
  UPDATE_CR_MATRIX_WINDOW_SIZE,
  UPDATE_SHOW_C_CHORD_WINDOW,
  UPDATE_C_CHORD_WINDOW_SIZE,
  UPDATE_SHOW_CM_MATRIX_WINDOW,
  UPDATE_CM_MATRIX_WINDOW_SIZE,
  UPDATE_SHOW_CM_SELECTED_BN_WINDOW,
  UPDATE_CM_SELECTED_BN_WINDOW_SIZE,
  UPDATE_SHOW_CM_SELECTED_FEATURE_TIMELINE_WINDOW,
  UPDATE_CM_SELECTED_FEATURE_TIMELINE_WINDOW_SIZE,
  UPDATE_SHOW_TRADE_EVENT_LIST_WINDOW,
  UPDATE_TRADE_EVENT_LIST_WINDOW_SIZE,
  UPDATE_SHOW_WORLD_MAP_WINDOW,
  UPDATE_POPUP_WINDOW_ORDER,
  UPDATE_CURRENT_DATASET_NAME,
  UPDATE_DATASET_LIST,
  FETCH_BAYESIAN_NETWORK_START,
  FETCH_MODIFIED_BAYESIAN_NETWORK_START,
  UPDATE_BAYESIAN_NETWORK,
  UPDATE_MODIFIED_BAYSIAN_NETWORK,
  UPDATE_CLUSTER_BAYESIAN_NETWORK,
  UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURES,
  UPDATE_FEATURE_SLICED_BAYESIAN_NETWORK,
  UPDATE_BAYESIAN_MODEL_FEATURE_SLICE_MAP,
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
  UPDATE_SELECTED_SUB_BAYESIAN_NETWORK_ID,
  UPDATE_CR_RELATIONS,
  UPDATE_CR_RELATION_FEATURES,
  UPDATE_CR_MATRIX_OPTIONS,
  UPDATE_CR_MATRIX_FOCUS,
  UPDATE_CM_CORRELATIONS,
  UPDATE_CM_SELECED_BN_FOCUS_LINK,
  UPDATE_CM_U_SELECTION,
  UPDATE_CM_SORT_OPTION,
  UPDATE_CM_SELECTED_FEATURE_TIMELINE_DATA,
  UPDATE_COUNTRIES,
  UPDATE_ITEMS,
  UPDATE_MT_SELECTED_MODEL,
  UPDATE_MT_MODEL_MOD,
  UPDATE_MT_MODEL_FEATURES,
  UPDATE_ACLED_LIST
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
  // the feature sliced Bayesian Network data:
  // [
  //  {
  //  source: (the source cluster id),
  //  target: (the target cluster id),
  //  weight: (the edge weight)
  //  },
  //  ...]
  featureSlicedBayesianNetwork: [],
  // the feature slice map:
  // {
  //  [feature]: [s1, s2], // slice
  //  ...
  // }
  bayesianModelFeatureSliceMap: {},
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
  // the sub Bayesian Network features, essentially the cluster map
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
    useHierarchy: false
  },
  showFeatureDistributionWindow: false,
  featureDistributionWindowSize: [600, 620],
  showBayesianNetworkDistributionWindow: false,
  bayesianNetworkDistributionWindowSize: [600, 620],
  showCrMatrixWindow: false,
  crMatrixWindowSize: [1200, 900],
  showCChordWindow: false,
  cChordWindowSize: [1200, 900],
  showCmMatrixWindow: false,
  cmMatrixWindowSize: [1200, 900],
  showCmSelectedBnWindow: false,
  cmSelectedBnWindowSize: [800, 600],
  showCmSelectedFeatureTimelineWindow: false,
  cmSelectedFeatureTimelineWindowSize: [800, 600],
  showTradeEventListWindow: false,
  tradeEventListWindowSize: [500, 800],
  showWorldMapWindow: false,
  popupWindowOrder: [
    'CrMatrix',
    'CChord',
    'CmMatrix',
    'CmSelectedBn',
    'CmSelectedFeatureTimeline',
    'TradeEventList',
    'WorldMap'
  ],
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
  selectedSubBayesianNetworkId: null,
  // the relation data in the cr-matrix
  // [
  //  {
  //    id: (pair id),
  //    source: (source id),
  //    target: (target id),
  //    value
  //  },
  //  ...
  // ]
  crRelations: [],
  // the cr relation features
  // [
  //  {
  //    id: (id),
  //    name: (name)
  //  },
  //  ...
  // ]
  crRelationFeatures: [],
  crMatrixOptions: {
    showRowNetwork: true,
    showColNetwork: true,
    showCrossNetwork: true
  },
  crMatrixFocus: null,
  // [
  //  {
  //    country, item, corr
  //  }
  // ]
  cmCorrelations: [],
  cmSelectedBnFocusLink: null,
  // 0 -- export
  // 1 -- import
  cmUSelection: 1,
  // 0 -- positive first
  // 1 -- negative first
  cmSortOption: 0,
  // cmSelectedFeatureTimelineData
  // {
  //  feature_id : {
  //    year : (value),
  //    ...
  //  },
  //  ...
  // }
  cmSelectedFeatureTimelineData: {},
  countries: [],
  items: [],
  mtSelectedModel: null,
  mtModelMod: null,
  mtModelFeatures: [],
  acledList: []
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

const handleUpdateShowCrMatrixWindow = (state, {payload}) => ({
  ...state,
  showCrMatrixWindow: payload
});

const handleUpdateShowCChordWindow = (state, {payload}) => ({
  ...state,
  showCChordWindow: payload
});

const handleUpdateCChordWindowSize = (state, {payload}) => ({
  ...state,
  cChordWindowSize: payload
});

const handleUpdateShowCmMatrixWindow = (state, {payload}) => ({
  ...state,
  showCmMatrixWindow: payload
});

const handleUpdateCmMatrixWindowSize = (state, {payload}) => ({
  ...state,
  cmMatrixWindowSize: payload
});

const handleUpdateShowCmSelectedBnWindow = (state, {payload}) => ({
  ...state,
  showCmSelectedBnWindow: payload
});

const handleUpdateCmSelectedBnWindowSize = (state, {payload}) => ({
  ...state,
  cmSelectedBnWindowSize: payload
});

const handleUpdateShowCmSelectedFeatureTimelineWindow = (state, {payload}) => ({
  ...state,
  showCmSelectedFeatureTimelineWindow: payload
});

const handleUpdateCmSelectedFeatureTimelineWindowSize = (state, {payload}) => ({
  ...state,
  cmSelectedFeatureTimelineWindowSize: payload
});

const handleUpdateShowTradeEventListWindow = (state, {payload}) => ({
  ...state,
  showTradeEventListWindow: payload
});

const handleUpdateTradeEventListWindowSize = (state, {payload}) => ({
  ...state,
  tradeEventListWindowSize: payload
});

const handleUpdateShowWorldMapWindow = (state, {payload}) => ({
  ...state,
  showWorldMapWindow: payload
});

const handleUpdateCrMatrixWindowSize = (state, {payload}) => ({
  ...state,
  crMatrixWindowSize: payload
});

const handleUpdatePopupWindowOrder = (state, {payload}) => ({
  ...state,
  popupWindowOrder: payload
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

const handleUpdateFeatureSlicedBayesianNetwork = (state, {payload}) => ({
  ...state,
  featureSlicedBayesianNetwork: payload
});

const handleUpdateBayesianModelFeatureSliceMap = (state, {payload}) => ({
  ...state,
  bayesianModelFeatureSliceMap: payload
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

const handleUpdateCrRelations = (state, {payload}) => ({
  ...state,
  crRelations: payload
});

const handleUpdateCrRelationFeatures = (state, {payload}) => ({
  ...state,
  crRelationFeatures: payload
});

const handleUpdateCrMatrixOptions = (state, {payload}) => ({
  ...state,
  crMatrixOptions: payload
});

const handleUpdateCrMatrixFocus = (state, {payload}) => ({
  ...state,
  crMatrixFocus: payload
});

const handleUpdateCmCorrelations = (state, {payload}) => ({
  ...state,
  cmCorrelations: payload
});

const handleUpdateCmSelectedBnFocusLink = (state, {payload}) => ({
  ...state,
  cmSelectedBnFocusLink: payload
});

const handleUpdateCmUSelection = (state, {payload}) => ({
  ...state,
  cmUSelection: payload
});

const handleUpdateCmSortOption = (state, {payload}) => ({
  ...state,
  cmSortOption: payload
});

const handleUpdateCmSelectedFeatureTimelineData = (state, {payload}) => ({
  ...state,
  cmSelectedFeatureTimelineData: payload
});

const handleUpdateCountries = (state, {payload}) => ({
  ...state,
  countries: payload
});

const handleUpdateItems = (state, {payload}) => ({
  ...state,
  items: payload
});

const handleUpdateMtSelectedModel = (state, {payload}) => ({
  ...state,
  mtSelectedModel: payload
});

const handleUpdateMtModelMod = (state, {payload}) => ({
  ...state,
  mtModelMod: payload
});

const handleUpdateMtModelFeatures = (state, {payload}) => ({
  ...state,
  mtModelFeatures: payload
});

const handleUpdateAcledList = (state, {payload}) => ({
  ...state,
  acledList: payload
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
    [UPDATE_SHOW_CR_MATRIX_WINDOW]: handleUpdateShowCrMatrixWindow,
    [UPDATE_SHOW_C_CHORD_WINDOW]: handleUpdateShowCChordWindow,
    [UPDATE_C_CHORD_WINDOW_SIZE]: handleUpdateCChordWindowSize,
    [UPDATE_CR_MATRIX_WINDOW_SIZE]: handleUpdateCrMatrixWindowSize,
    [UPDATE_SHOW_BAYESIAN_NETWORK_SUB_NETWORK_DETAIL_WINDOW]: handleUpdateShowBayesianNetworkSubNetworkDetailWindow,
    [UPDATE_SHOW_CM_SELECTED_BN_WINDOW]: handleUpdateShowCmSelectedBnWindow,
    [UPDATE_CM_SELECTED_BN_WINDOW_SIZE]: handleUpdateCmSelectedBnWindowSize,
    [UPDATE_SHOW_CM_MATRIX_WINDOW]: handleUpdateShowCmMatrixWindow,
    [UPDATE_CM_MATRIX_WINDOW_SIZE]: handleUpdateCmMatrixWindowSize,
    [UPDATE_SHOW_CM_SELECTED_FEATURE_TIMELINE_WINDOW]: handleUpdateShowCmSelectedFeatureTimelineWindow,
    [UPDATE_CM_SELECTED_FEATURE_TIMELINE_WINDOW_SIZE]: handleUpdateCmSelectedFeatureTimelineWindowSize,
    [UPDATE_SHOW_TRADE_EVENT_LIST_WINDOW]: handleUpdateShowTradeEventListWindow,
    [UPDATE_TRADE_EVENT_LIST_WINDOW_SIZE]: handleUpdateTradeEventListWindowSize,
    [UPDATE_SHOW_WORLD_MAP_WINDOW]: handleUpdateShowWorldMapWindow,
    [UPDATE_POPUP_WINDOW_ORDER]: handleUpdatePopupWindowOrder,
    [UPDATE_CURRENT_DATASET_NAME]: handleUpdateCurrentDatasetName,
    [UPDATE_DATASET_LIST]: handleUpdateDatasetList,
    [FETCH_BAYESIAN_NETWORK_START]: handleFetchBayesianNetworkStart,
    [FETCH_MODIFIED_BAYESIAN_NETWORK_START]: handleFetchModifiedBayesianNetworkStart,
    [UPDATE_BAYESIAN_NETWORK]: handleUpdateBayesianNetwork,
    [UPDATE_MODIFIED_BAYSIAN_NETWORK]: handleUpdateModifiedBayesianNetwork,
    [UPDATE_BAYESIAN_MODEL_FEATURES]: handleUpdateBayesianModelFeatures,
    [UPDATE_CLUSTER_BAYESIAN_NETWORK]: handleUpdateClusterBayesianNetwork,
    [UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURES]: handleUpdateClusterBayesianModelFeatures,
    [UPDATE_FEATURE_SLICED_BAYESIAN_NETWORK]: handleUpdateFeatureSlicedBayesianNetwork,
    [UPDATE_BAYESIAN_MODEL_FEATURE_SLICE_MAP]: handleUpdateBayesianModelFeatureSliceMap,
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
    [UPDATE_SELECTED_SUB_BAYESIAN_NETWORK_ID]: handleUpdateSelectedSubBayesianNetworkId,
    [UPDATE_CR_RELATIONS]: handleUpdateCrRelations,
    [UPDATE_CR_RELATION_FEATURES]: handleUpdateCrRelationFeatures,
    [UPDATE_CR_MATRIX_OPTIONS]: handleUpdateCrMatrixOptions,
    [UPDATE_CR_MATRIX_FOCUS]: handleUpdateCrMatrixFocus,
    [UPDATE_CM_CORRELATIONS]: handleUpdateCmCorrelations,
    [UPDATE_CM_SELECED_BN_FOCUS_LINK]: handleUpdateCmSelectedBnFocusLink,
    [UPDATE_CM_U_SELECTION]: handleUpdateCmUSelection,
    [UPDATE_CM_SORT_OPTION]: handleUpdateCmSortOption,
    [UPDATE_CM_SELECTED_FEATURE_TIMELINE_DATA]: handleUpdateCmSelectedFeatureTimelineData,
    [UPDATE_COUNTRIES]: handleUpdateCountries,
    [UPDATE_ITEMS]: handleUpdateItems,
    [UPDATE_MT_SELECTED_MODEL]: handleUpdateMtSelectedModel,
    [UPDATE_MT_MODEL_MOD]: handleUpdateMtModelMod,
    [UPDATE_MT_MODEL_FEATURES]: handleUpdateMtModelFeatures,
    [UPDATE_ACLED_LIST]: handleUpdateAcledList
  },
  DEFAULT_STATE
);
