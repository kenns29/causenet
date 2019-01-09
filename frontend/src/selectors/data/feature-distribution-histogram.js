import {createSelector} from 'reselect';
import {scaleLinear} from 'd3-scale';
import {histogram} from 'd3-array';
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

export const getFeatureDistributionList = createSelector(
  getRawSelectedNormalizedFeatureDistributionMap,
  featureDistributionMap =>
    Object.entries(featureDistributionMap).map(([id, valueMap]) => ({
      id,
      values: Object.entries(valueMap).map(([key, value]) => ({key, value}))
    }))
);

export const getFeatureDistributionHistogramData = createSelector(
  getFeatureDistributionList,
  featureDistributionList => {
    const histGenerator = histogram()
      .value(d => d.value)
      .domain([0, 1])
      .thresholds(100);
    return featureDistributionList.map(({id, values}) => ({
      id,
      data: histGenerator(values)
    }));
  }
);

export const getFeatureDistributionHistogramLayouts = createSelector(
  [
    getFeatureDistributionHistogramData,
    getFeatureDistributionHistogramSmallMultipleGrid
  ],
  (histData, [gx, gy]) => {
    const {
      SIZE: [w, h],
      PADDING: [pl, pt, pr, pb],
      MARGIN: [ml, mt, mr, mb],
      CONTAINER_MARGIN: [cml, cmt, cmr, cmb],
      AXIS_OFFSETS: [ax, ay]
    } = FEATURE_DISTRIBUTION_HISTOGRAM;
    return histData.map(({id, data}, index) => {
      const maxBinSize = data.reduce((max, d) => Math.max(max, d.length), 0);
      const [xi, yi] = [index % gx, Math.floor(index / gx)];
      const [sx, sy] = [xi * (w + pl + pr) + cml, yi * (h + pt + pb) + cmt];
      const yb = sy + h - mb - ay;
      const [scaleX, scaleY] = [
        [[0, 1], [sx + ml + ax, sx + w - mr]],
        [[0, maxBinSize], [yb, sy + mt]]
      ].map(([domain, range]) =>
        scaleLinear()
          .domain(domain)
          .range(range)
      );
      const bins = data.map((d, i) => {
        const size = d.length;
        const {x0, x1} = d;
        const [xl, xr] = [x0, x1].map(scaleX);
        const y = scaleY(size);
        return {
          size,
          data: d,
          x0,
          x1,
          polygon: [[xl, yb], [xr, yb], [xr, y], [xl, y], [xl, yb]]
        };
      });
      return {
        id,
        bins,
        position: [sx, sy],
        size: [w, h]
      };
    });
  }
);
