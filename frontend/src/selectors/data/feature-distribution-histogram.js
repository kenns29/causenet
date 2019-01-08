import {createSelector} from 'reselect';
import {rootSelector, getFeatureDistributionWindowSize} from '../base';
import {getRawSelectedNormalizedFeatureDistributionMap} from './raw';
import {FEATURE_DISTRIBUTION_HISTOGRAM} from '../../constants';

export const getFeatureDistributionHistogramContainerWidth = createSelector(
  getFeatureDistributionWindowSize,
  ([width, height]) => {
    const {
      SIZE: [w, h],
      PADDING: [pl, pt, pr, pb],
      CONTAINER_MARGIN: [ml, mt, mr, mb]
    } = FEATURE_DISTRIBUTION_HISTOGRAM;
    return Math.max(width, w + pl + pr + 5);
  }
);

export const getFeatureDistributionHistogramSmallMultipleGrid = createSelector(
  [
    getRawSelectedNormalizedFeatureDistributionMap,
    getFeatureDistributionHistogramContainerWidth
  ],
  (map, cw) => {
    const {
      SIZE: [w, h],
      PADDING: [pl, pt, pr, pb],
      CONTAINER_MARGIN: [ml, mt, mr, mb]
    } = FEATURE_DISTRIBUTION_HISTOGRAM;
    const gx = Math.floor((cw - ml - mr) / (w + pl + pr));
    const gy = Math.ceil(Object.keys(map).length / gx);
    return [gx, gy];
  }
);

export const getFeatureDistributionHistogramContainerHeight = createSelector(
  [
    getRawSelectedNormalizedFeatureDistributionMap,
    getFeatureDistributionHistogramSmallMultipleGrid
  ],
  (map, [gx, gy]) => {
    const {
      SIZE: [w, h],
      PADDING: [pl, pt, pr, pb],
      CONTAINER_MARGIN: [ml, mt, mr, mb]
    } = FEATURE_DISTRIBUTION_HISTOGRAM;
    return gy * (h + pt + pb) + mt + mb;
  }
);
