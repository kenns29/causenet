import {createSelector} from 'reselect';
import {
  getRawSubBayesianModelFeaturesMap,
  getRawBayesianModelFeatureSliceMap
} from './raw';

export const getBayesianModelFeatureSlicesTableData = createSelector(
  [getRawBayesianModelFeatureSliceMap, getRawSubBayesianModelFeaturesMap],
  (featureSliceMap, clusterMap) => {
    if (Object.keys(clusterMap).length === 0) {
      return [];
    }
    return Object.entries(featureSliceMap).map(([feature, slice]) => ({
      key: feature,
      feature: (clusterMap[feature].length > 1
        ? feature
        : clusterMap[feature][0]
      ).slice(0, 10),
      slice
    }));
  }
);
