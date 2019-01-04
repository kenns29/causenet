import {createSelector} from 'reselect';
import memoize from 'lodash.memoize';
import {scaleLinear} from 'd3-scale';
import {rootSelector, getBayesianNetworkDistributionWindowSize} from '../base';
import {
  getRawDistributionFeaturePairs,
  getRawSelectedNormalizedFeatureDistributionMap
} from './raw';
import {DISTRIBUTION_SCATTERPLOT} from '../../constants';

console.log('DISTRIBUTION_SCATTERPLOT', DISTRIBUTION_SCATTERPLOT);

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
      SIZE: [w, h],
      PADDING: [pl, pt, pr, pb],
      CONTAINER_MARGIN: [ml, mt, mr, mb]
    } = DISTRIBUTION_SCATTERPLOT;
    const gx = Math.floor((cw - ml - mr) / (w + pl + pr));
    const gy = Math.ceil(pairs.length / gx);
    return [gx, gy];
  }
);

export const getPairDistributionScatterplotContainerHeight = createSelector(
  [
    getRawDistributionFeaturePairs,
    getPairDistributionScatterplotSmallMultipleGrid
  ],
  (pairs, [gx, gy]) => {
    const {
      SIZE: [w, h],
      PADDING: [pl, pt, pr, pb],
      CONTAINER_MARGIN: [ml, mt, mr, mb]
    } = DISTRIBUTION_SCATTERPLOT;
    return gy * (h + pt + pb) + mt + mb;
  }
);

export const getPairDistributionScatterplotLayouts = createSelector(
  [
    getRawDistributionFeaturePairs,
    getRawSelectedNormalizedFeatureDistributionMap,
    getPairDistributionScatterplotSmallMultipleGrid
  ],
  (pairs, distributionMap, [gx, gy]) => {
    const {
      SIZE: [w, h],
      PADDING: [pl, pt, pr, pb],
      CONTAINER_MARGIN: [ml, mt, mr, mb],
      AXIS_OFFSETS: [ax, ay]
    } = DISTRIBUTION_SCATTERPLOT;

    const plots = pairs.map((pair, index) => {
      const [xIndex, yIndex] = [index % gx, Math.floor(index / gx)];
      const [sx, sy] = [
        xIndex * (w + pl + pr) + ml,
        yIndex * (h + pt + pb) + mt
      ];
      const scaleX = scaleLinear()
        .domain([0, 1])
        .range([sx + ax, sx + w]);
      const scaleY = scaleLinear()
        .domain([0, 1])
        .range([sy + h - ay, sy]);
      const {source, target, id} = pair;
      const [svMap, tvMap] = [source, target].map(id => distributionMap[id]);
      const points = ![svMap, tvMap].some(d => !d)
        ? Object.keys(svMap).map(key => {
          const [sv, tv] = [svMap[key], tvMap[key]];
          return {
            key,
            source,
            target,
            values: [sv, tv],
            position: [scaleX(sv), scaleY(tv)]
          };
        })
        : [];
      return {
        id,
        points,
        size: [w, h],
        position: [sx, sy]
      };
    });
    return plots;
  }
);
