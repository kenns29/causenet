import {createSelector} from 'reselect';
import {scaleLinear} from 'd3-scale';
import {histogram} from 'd3-array';
import {getCurvePoints} from 'cardinal-spline-js';
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
      .thresholds(20);
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
          xl,
          xr,
          y
        };
      });

      const controlPoints = bins.map(({xl, xr, y}) => [(xl + xr) / 2, y]);
      const startPoint = [bins[0].xl, bins[0].y];
      const endPoint = [bins[bins.length - 1].xr, bins[bins.length - 1].y];
      const path = getCurvePoints(
        [...startPoint, ...controlPoints.toString().split(','), ...endPoint],
        0.5,
        10
      );

      const points = [];
      for (let i = 0; i < path.length - 1; i += 2) {
        points.push([path[i], path[i + 1]]);
      }

      for (
        let i = 0, pi = 0, xi = 0;
        i < points.length && xi < bins.length;
        i++
      ) {
        const x = points[i][0];
        const {xl, xr} = bins[xi];
        if (x >= xr) {
          const segment = points.slice(pi, x === xr ? i + 1 : i);
          bins[xi].polygon = [...segment, [xr, yb], [xl, yb], points[pi]];
          pi = i;
          ++xi;
        }
      }

      return {
        id,
        bins,
        position: [sx, sy],
        size: [w, h]
      };
    });
  }
);
