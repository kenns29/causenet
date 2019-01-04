import {createSelector} from 'reselect';
import memoize from 'lodash.memoize';
import {scaleLinear} from 'd3-scale';
import {rootSelector, getBayesianNetworkDistributionWindowSize} from '../base';
import {
  getRawDistributionFeaturePairs,
  getRawSelectedNormalizedFeatureDistributionMap
} from './raw';
import {DISTRIBUTION_SCATTERPLOT} from '../../../constans';

export const getPairDistributionScatterplotContainerWidth = createSelector(
  getBayesianNetworkDistributionWindowSize,
  ([width, height]) => width
);

export const getPairDistributionScatterplotSmallMultipleGrid = createSelector(
  [
    getRawDistributionFeaturePairs,
    getPairDistributionScatterplotContainerWidth
  ],
  (pairs, cw) => {
    const {
      SIZE: [w, h]
    } = DISTRIBUTION_SCATTERPLOT;
    const gx = Math.floor(cw / w);
    const gy = Math.ceiling(pairs.length / gx);
    return [gx, gy];
  }
);

export const getPairDistributionScatterplots = createSelector(
  [
    getRawDistributionFeaturePairs,
    getRawSelectedNormalizedFeatureDistributionMap
  ],
  (pairs, distributionMap) => {
    const [axisOffsetX, axisOffsetY] = SCATTERPLOT_AXIS_OFFSETS;
    const [width, height] = SCATTERPLOT_PLOT_SIZE;
    const scaleX = scaleLinear()
      .domain([0, 1])
      .range([axisOffsetX, width]);
    const scaleY = scaleLinear()
      .domain([0, 1])
      .range([height, axisOffsetY]);
    const plots = pairs.map((pair, index) => {
      const {source, target, id} = pair;
      const [sourceValueMap, targetValueMap] = [source, target].map(
        id => selectedNormalizedFeatureDistributionMap[id]
      );
      if ([sourceValueMap, targetValueMap].some(d => !d)) {
        return [];
      }
      const points = Object.keys(sourceValues).map(key => {
        const [sourceValue, targetValue] = [
          sourceValueMap[key],
          targetValueMap[key]
        ];
        let [x, y] = [sourceValue, targetValue].map(scale);
        [x, y] = [];
        return {
          key,
          source,
          target,
          values: [sourceValue, targetValue],
          position: [x, y]
        };
      });
      return {
        id,
        points
      };
    });
    return plots;
  }
);
