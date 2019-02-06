import {createSelector} from 'reselect';
import {rootSelector} from '../base';

export const getCurrentDatasetName = createSelector(
  rootSelector,
  state => state.currentDatasetName
);

export const getDatasetList = createSelector(
  rootSelector,
  state => state.datasetList
);

export const getModelList = createSelector(
  rootSelector,
  state => state.modelList
);

export const getSelectedModel = createSelector(
  rootSelector,
  state => state.selectedModel
);

export const getIsFetchingModifiedBayesianNetwork = createSelector(
  rootSelector,
  state => state.isFetchingModifiedBayesianNetwork
);

export const getRawBayesianNetwork = createSelector(
  rootSelector,
  state => state.bayesianNetwork
);

export const getRawModifiedBayesianNetwork = createSelector(
  rootSelector,
  state => state.modifiedBayesianNetwork
);

export const getRawClusterBayesianNetwork = createSelector(
  rootSelector,
  state => state.clusterBayesianNetwork
);

export const getRawClusterBayesianModelFeatures = createSelector(
  rootSelector,
  state => state.clusterBayesianModelFeatures
);

export const getRawFeatureSlicedBayesianNetwork = createSelector(
  rootSelector,
  state => state.featureSlicedBayesianNetwork
);

export const getRawBayesianModelFeatureSliceMap = createSelector(
  rootSelector,
  state => state.bayesianModelFeatureSliceMap
);

export const getRawClusterBayesianNetworkFocus = createSelector(
  rootSelector,
  state => state.clusterBayesianNetworkFocus
);

export const getRawSubBayesianNetworkMap = createSelector(
  rootSelector,
  state => state.subBayesianNetworkMap
);

export const getRawSubBayesianModelFeaturesMap = createSelector(
  rootSelector,
  state => state.subBayesianModelFeaturesMap
);

export const getRawSubBayesianNetworkSliceMap = createSelector(
  rootSelector,
  state => state.subBayesianNetworkSliceMap
);

export const getRawBayesianModelFeatures = createSelector(
  rootSelector,
  state => state.bayesianModelFeatures
);

export const getRawBayesianModelFeatureValueSelectionMap = createSelector(
  rootSelector,
  state => state.bayesianModelFeatureValueSelectionMap
);

export const getHighlightedBayesianNetworkEdge = createSelector(
  rootSelector,
  state => state.highlightedBayesianNetworkEdge
);

export const getHighlightedBayesianModelFeature = createSelector(
  rootSelector,
  state => state.highlightedBayesianModelFeature
);

export const getHierarchicalClusteringOption = createSelector(
  rootSelector,
  state => state.hierarchicalClusteringOption
);

export const getRawHierarchicalClusteringTree = createSelector(
  rootSelector,
  state => state.hierarchicalClusteringTree
);

export const getHierarchicalClusteringCutThreshold = createSelector(
  rootSelector,
  state => state.hierarchicalClusteringCutThreshold
);

export const getRawDistanceMap = createSelector(
  rootSelector,
  state => state.distanceMap
);

export const getRawFeatureSelection = createSelector(
  rootSelector,
  state => state.featureSelection
);

export const getRawFeatureValuesMap = createSelector(
  rootSelector,
  state => state.featureValuesMap
);

export const getNodeLinkViewOptions = createSelector(
  rootSelector,
  state => state.nodeLinkViewOptions
);

export const getRawDistributionFeaturePairs = createSelector(
  rootSelector,
  state => state.distributionFeaturePairs
);

export const getRawSelectedNormalizedFeatureDistributionMap = createSelector(
  rootSelector,
  state => state.selectedNormalizedFeatureDistributionMap
);

export const getSelectedSubBayesianNetworkId = createSelector(
  rootSelector,
  state => state.selectedSubBayesianNetworkId
);

export const getCrRelations = createSelector(
  rootSelector,
  state => state.crRelations
);
