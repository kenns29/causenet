import {progressFetch as fetch} from '../utils';
import {createAction} from 'redux-actions';
import {BACKEND_URL} from '../constants';

// UI action ids
export const UPDATE_SCREEN_SIZE = 'UPDATE_SCREEN_SIZE';
export const UPDATE_NAV_PANEL_WIDTH = 'UPDATE_NAV_PANEL_WIDTH';
export const UPDATE_CONTENT_PANEL_CENTER = 'UPDATE_CONTENT_PANEL_CENTER';
export const UPDATE_SHOW_BAYESIAN_NETWORK_DISTRIBUTION_WINDOW =
  'UPDATE_SHOW_BAYESIAN_NETWORK_DISTRIBUTION_WINDOW';

// data Action ids
export const UPDATE_CURRENT_DATASET_NAME = 'UPDDATE_CURRENT_DATASET_NAME';
export const UPDATE_DATASET_LIST = 'UPDATE_DATASET_LIST';
export const FETCH_BAYESIAN_NETWORK_START = 'FETCH_BAYESIAN_NETWORK_START';
export const FETCH_MODIFIED_BAYESIAN_NETWORK_START =
  'FETCH_MODIFIED_BAYESIAN_NETWORK_START';
export const UPDATE_BAYESIAN_NETWORK = 'UPDATE_BAYESIAN_NETWORK';
export const UPDATE_MODIFIED_BAYSIAN_NETWORK =
  'UPDATE_MODIFIED_BAYSIAN_NETWORK';
export const UPDATE_CLUSTER_BAYESIAN_NETWORK =
  'UPDATE_CLUSTER_BAYESIAN_NETWORK';
export const UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURES =
  'UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURES';
export const UPDATE_SUB_BAYESIAN_NETWORK_MAP =
  'UPDATE_SUB_BAYESIAN_NETWORK_MAP';
export const UPDATE_SUB_BAYESIAN_MODEL_FEATURES_MAP =
  'UPDATE_SUB_BAYESIAN_MODEL_FEATURES_MAP';
export const UPDATE_SUB_BAYESIAN_NETWORK_SLICE_MAP =
  'UPDATE_SUB_BAYESIAN_NETWORK_SLICE_MAP';
export const UPDATE_BAYESIAN_MODEL_FEATURES = 'UPDATE_BAYESIAN_MODEL_FEATURES';
export const UPDATE_BAYESIAN_MODEL_FEATURE_VALUE_SELECTION_MAP =
  'UPDATE_BAYESIAN_MODEL_FEATURE_VALUE_SELECTION_MAP';
export const UPDATE_HIGHLIGHTED_BAYESIAN_NETWORK_EDGE =
  'UPDATE_HIGHLIGHTED_BAYESIAN_NETWORK_EDGE';
export const UPDATE_HIGHLIGHTED_BAYESIAN_MODEL_FEATURE =
  'UPDATE_HIGHLIGHTED_BAYESIAN_MODEL_FEATURE';
export const UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURE =
  'UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURE';
export const UPDATE_MODEL_LIST = 'UPDATE_MODEL_LIST';
export const UPDATE_SELECTED_MODEL = 'UPDATE_SELECTED_MODEL';
export const UPDATE_NODE_LINK_VIEW_OPTIONS = 'UPDATE_NODE_LINK_VIEW_OPTIONS';
export const UPDATE_HIERARCHICAL_CLUSTERING_OPTION =
  'UPDATE_HIERARCHICAL_CLUSTERING_OPTION';
export const UPDATE_HIERARCHICAL_CLUSTERING_TREE =
  'UPDATE_HIERARCHICAL_CLUSTERING_TREE';
export const UPDATE_DISTANCE_MAP = 'UPDATE_DISTANCE_MAP';
export const UPDATE_HIERARCHICAL_CLUSTERING_CUT_THRESHOLD =
  'UPDATE_HIERARCHICAL_CLUSTERING_CUT_THRESHOLD';
export const UPDATE_FEATURE_LIST = 'UPDATE_FEATURE_LIST';
export const UPDATE_FEATURE_SELECTION = 'UPDATE_FEATURE_SELECTION';
export const UPDATE_FEATURE_VALUES_MAP = 'UPDATE_FEATURE_VALUE_MAP';
export const UPDATE_DISTRIBUTION_FEATURE_PAIRS =
  'UPDATE_DISTRIBUTION_FEATURE_PAIRS';
export const UPDATE_SELECTED_NORMALIZED_FEATURE_DISTRIBUTION_MAP =
  'UPDATE_SELECTED_NORMALIZED_FEATURE_DISTRIBUTION_MAP';

// UI actions
export const updateScreenSize = createAction(UPDATE_SCREEN_SIZE);
export const updateNavPanelWidth = createAction(UPDATE_NAV_PANEL_WIDTH);
export const updateContentPanelCenter = createAction(
  UPDATE_CONTENT_PANEL_CENTER
);
export const updateShowBayesianNetworkDistributionWindow = createAction(
  UPDATE_SHOW_BAYESIAN_NETWORK_DISTRIBUTION_WINDOW
);

// data actions
export const updateCurrentDatasetName = createAction(
  UPDATE_CURRENT_DATASET_NAME
);
export const updateDatasetList = createAction(UPDATE_DATASET_LIST);
export const fetchBayesianNetworkStart = createAction(
  FETCH_BAYESIAN_NETWORK_START
);
export const fetchModifiedBayesianNetworkStart = createAction(
  FETCH_MODIFIED_BAYESIAN_NETWORK_START
);
export const updateBayesianNetwork = createAction(UPDATE_BAYESIAN_NETWORK);
export const updateModifiedBayesianNetwork = createAction(
  UPDATE_MODIFIED_BAYSIAN_NETWORK
);
export const updateClusterBayesianNetwork = createAction(
  UPDATE_CLUSTER_BAYESIAN_NETWORK
);
export const updateClusterBayesianModelFeatures = createAction(
  UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURES
);
export const updateSubBayesianNetworkMap = createAction(
  UPDATE_SUB_BAYESIAN_NETWORK_MAP
);
export const updateSubBayesianModelFeaturesMap = createAction(
  UPDATE_SUB_BAYESIAN_MODEL_FEATURES_MAP
);
export const updateSubBayesianNetworkSliceMap = createAction(
  UPDATE_SUB_BAYESIAN_NETWORK_SLICE_MAP
);
export const updateBayesianModelFeatures = createAction(
  UPDATE_BAYESIAN_MODEL_FEATURES
);
export const updateBayesianModelFeatureValueSelectionMap = createAction(
  UPDATE_BAYESIAN_MODEL_FEATURE_VALUE_SELECTION_MAP
);
export const updateHighlightedBayesianNetworkEdge = createAction(
  UPDATE_HIGHLIGHTED_BAYESIAN_NETWORK_EDGE
);
export const updateHighlightedBayesianModelFeature = createAction(
  UPDATE_HIGHLIGHTED_BAYESIAN_MODEL_FEATURE
);
export const updateClusterBaysianModelFeatue = createAction(
  UPDATE_CLUSTER_BAYESIAN_MODEL_FEATURE
);
export const updateModelList = createAction(UPDATE_MODEL_LIST);
export const updateSelectedModel = createAction(UPDATE_SELECTED_MODEL);
export const updateNodeLinkViewOptions = createAction(
  UPDATE_NODE_LINK_VIEW_OPTIONS
);
export const updateHierarchicalClusteringOption = createAction(
  UPDATE_HIERARCHICAL_CLUSTERING_OPTION
);
export const updateHierarchicalClusteringTree = createAction(
  UPDATE_HIERARCHICAL_CLUSTERING_TREE
);
export const updateDistanceMap = createAction(UPDATE_DISTANCE_MAP);
export const updateHierarchicalClusteringCutThreshold = createAction(
  UPDATE_HIERARCHICAL_CLUSTERING_CUT_THRESHOLD
);
export const updateFeatureSelection = createAction(UPDATE_FEATURE_SELECTION);
export const updateFeatureValuesMap = createAction(UPDATE_FEATURE_VALUES_MAP);
export const updateDistributionFeaturePairs = createAction(
  UPDATE_DISTRIBUTION_FEATURE_PAIRS
);
export const updateSelectedNormalizedFeatureDistributionMap = createAction(
  UPDATE_SELECTED_NORMALIZED_FEATURE_DISTRIBUTION_MAP
);

// async actions
export const fetchCurrentDatasetName = () => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_current_dataset_name`);
    const {name} = await response.json();
    dispatch(updateCurrentDatasetName(name));
    return Promise.resolve(name);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestUpdateCurrentDatasetName = name => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/update_current_dataset_name?name=${name}`
    );
    const {name: newName} = await response.json();
    dispatch(updateCurrentDatasetName(newName));
    return Promise.resolve(newName);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchDatasetList = () => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_dataset_list`);
    const data = await response.json();
    const list = data.map(({name}) => name);
    dispatch(updateDatasetList(list));
    return Promise.resolve(list);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchBayesianNetwork = ({name = 'model'}) => async dispatch => {
  try {
    dispatch(fetchBayesianNetworkStart());
    const response = await fetch(`${BACKEND_URL}/load_model?name=${name}`);
    const data = await response.json();
    dispatch(updateBayesianNetwork(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchModifiedBayesianNetwork = ({
  name = 'model'
}) => async dispatch => {
  try {
    dispatch(fetchModifiedBayesianNetworkStart());
    const response = await fetch(
      `${BACKEND_URL}/load_modified_model?name=${name}`
    );
    const data = await response.json();
    dispatch(updateModifiedBayesianNetwork(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchBayesianModelFeatures = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/load_model_features?name=${name}`
    );
    const data = await response.json();
    dispatch(updateBayesianModelFeatures(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchClusterBayesianNetwork = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_model?name=${name}`);
    const data = await response.json();
    dispatch(updateClusterBayesianNetwork(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchClusterBayesianModelFeatures = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/load_model_features?name=${name}`
    );
    const data = await response.json();
    dispatch(updateClusterBayesianModelFeatures(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchSubBayesianNetworks = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_sub_models?name=${name}`);
    const data = await response.json();
    const edgesMap = Object.entries(data).reduce(
      (map, [key, {edges}]) => Object.assign(map, {[key]: edges}),
      {}
    );
    dispatch(updateSubBayesianNetworkMap(edgesMap));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchSubBayesianModelFeaturesMap = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/load_model_clusters?name=${name}`
    );
    const data = await response.json();
    dispatch(updateSubBayesianModelFeaturesMap(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Request replace sub Bayesian models. The replacement may also change the
 * structure of the main model
 * @param {String} name -- the name of the main model
 * @param {Array} targets -- the sub models to be replaced. Format:
 *                [id1, ...] -- list of ids of the sub models to be replaced
 * @param {Array} replacements -- list of model replacement arguments. Format:
 *                [{
 *                  id: [id of the sub model],
 *                  features: [feature, ...] // the list of the features of the model
 *                },
 *                ...]
 * @return {Promise}
 */
export const requestReplaceSubBayesianModels = ({
  name = 'model',
  targets = [],
  replacements = []
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/replace_sub_models?name=${name}`,
      {
        method: 'POST',
        body: JSON.stringify({targets, replacements})
      }
    );
    const data = await response.json();
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchModelList = () => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_model_list`);
    const data = await response.json();
    dispatch(updateModelList(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestDeleteModel = ({name = 'model'}) => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/delete_model?name=${name}`);
    const data = await response.json();
    dispatch(updateModelList(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestTrainBayesianModel = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/train_bayesian_model?name=${name}`
    );
    const data = await response.json();
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestTrainClusterBayesianModel = ({
  name = 'model',
  clusters
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/train_cluster_bayesian_model?name=${name}`,
      {
        method: 'POST',
        body: JSON.stringify(clusters)
      }
    );
    const data = await response.json();
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestTrainSubBayesianModelsWithinCluster = ({
  name = 'model',
  clusters
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/train_sub_bayesian_model_within_clusters?name=${name}`,
      {
        method: 'POST',
        body: JSON.stringify(clusters)
      }
    );
    const data = await response.json();
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchHierarchicalClusteringTree = clusteringOption => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/load_clustering_tree?clustering_option=${clusteringOption}`
    );
    const data = await response.json();
    dispatch(updateHierarchicalClusteringTree(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchDistanceMap = () => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_distance_map`);
    const data = await response.json();
    dispatch(updateDistanceMap(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchFeatureSelection = () => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_feature_selection`);
    const data = await response.json();
    dispatch(updateFeatureSelection(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestUpdateFeatureSelection = features => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/update_feature_selection`, {
      method: 'POST',
      body: JSON.stringify(features)
    });
    const data = await response.json();
    dispatch(updateFeatureSelection(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestToggleFeatureSelection = (
  feature,
  features
) => async dispatch => {
  try {
    if (features === null || features === undefined) {
      dispatch(requestUpdateFeatureSelection([feature]));
    } else {
      const filtered = features.filter(d => d !== feature);
      dispatch(
        requestUpdateFeatureSelection(
          filtered.length
            ? filtered.length < features.length
              ? filtered
              : features.concat(feature)
            : null
        )
      );
    }
    return Promise.resolve('SUCCESS');
  } catch (err) {
    return new Error(err);
  }
};

export const fetchFeatureValuesMap = features => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_feature_values_map`);
    const data = await response.json();
    dispatch(updateFeatureValuesMap(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchModelFeatureValueSelectionMap = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/load_model_feature_value_selection_map?name=${name}`
    );
    const data = await response.json();
    dispatch(updateBayesianModelFeatureValueSelectionMap(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestUpdateModelFeatureValueSelectionMap = ({
  name = 'model',
  featureValueSelectionMap
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/update_model_feature_value_selection_map?name=${name}`,
      {
        method: 'POST',
        body: JSON.stringify(featureValueSelectionMap)
      }
    );
    const data = await response.json();
    dispatch(updateBayesianModelFeatureValueSelectionMap(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestFetchData = ({
  data_type = 'base_avg_data_file',
  featureSelection = null
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/load_data?data_type=${data_type}`,
      {
        method: 'POST',
        body: featureSelection && JSON.stringify(featureSelection)
      }
    );
    const data = response.json();
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

// bundled actions
export const bundleFetchBayesianModel = name => async dispatch => {
  try {
    const modifiedBayesianNetwork = await dispatch(
      fetchModifiedBayesianNetwork({name})
    );
    const datas = await Promise.all([
      dispatch(fetchBayesianModelFeatures({name})),
      dispatch(fetchModelFeatureValueSelectionMap({name})),
      dispatch(fetchBayesianNetwork({name}))
    ]);
    return Promise.resolve([modifiedBayesianNetwork, ...datas]);
  } catch (err) {
    throw new Error(err);
  }
};

export const bundleFetchClusterBayesianModel = name => async dispatch => {
  try {
    const datas = await Promise.all([
      dispatch(fetchClusterBayesianNetwork({name})),
      dispatch(fetchClusterBayesianModelFeatures({name})),
      dispatch(fetchSubBayesianNetworks({name})),
      dispatch(fetchSubBayesianModelFeaturesMap({name}))
    ]);
    return Promise.resolve(datas);
  } catch (err) {
    throw new Error(err);
  }
};

export const bundleFetchAddToSelectedNormalizedFeatureDistributionMap = ({
  featureSelection = null,
  selectedNormalizedFeatureDistributionMap
}) => async dispatch => {
  try {
    const data = await dispatch(requestFetchData({featureSelection}));
    const rMap = {...selectedNormalizedFeatureDistributionMap, ...data};
    dispatch(updateSelectedNormalizedFeatureDistributionMap(rMap));
    return Promise.resolve(rMap);
  } catch (err) {
    throw new Error(err);
  }
};

export const bundleAddToDistributionFeaturePairs = ({
  pair,
  distributionFeaturePairs
}) => dispatch =>
  dispatch(updateDistributionFeaturePairs([...distributionFeaturePairs, pair]));
