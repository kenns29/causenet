import {createSelector} from 'reselect';
import {line as d3Line, curveCardinal} from 'd3-shape';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {range as d3Range} from 'd3-array';
import {schemeCategory10} from 'd3-scale-chromatic';
import {rootSelector, getCmSelectedFeatureTimelineWindowSize} from '../base';
import {getRawCmSelectedFeatureTimelineData} from './raw';

const MARGINS = [30, 60, 30, 30];
const HEIGHT = 500;

const getCmTimelines = createSelector(
  getRawCmSelectedFeatureTimelineData,
  data =>
    Object.entries(data).map(([id, valueMap]) => ({
      id,
      values: Object.entries(valueMap).map(([year, value]) => ({year, value}))
    }))
);

const getCmTimelineYearDomain = createSelector(getCmTimelines, timelines => {
  if (timelines.length === 0) {
    return null;
  }
  return timelines[0].values.reduce(
    ([min, max], {year}) => [Math.min(min, year), Math.max(max, year)],
    [Infinity, -Infinity]
  );
});

const getCmTimelineTradeValueDomain = createSelector(
  getCmTimelines,
  timelines => {
    const tls = timelines.filter(d => d.id !== 'stability');
    if (tls.length === 0) {
      return null;
    }
    let [min, max] = [-Infinity, Infinity];
    timelines.forEach(({values}) => {
      values.forEach(({value}) => {
        min = Math.min(value, min);
        max = Math.max(value, max);
      });
    });
    return [min, max];
  }
);

const getCmTimelineStabilityValueDomain = createSelector(
  getCmTimelines,
  timelines => {
    const tls = timelines.filter(d => d.id === 'stability');
    if (tls.length === 0) {
      return null;
    }
    let [min, max] = [-Infinity, Infinity];
    timelines.forEach(({values}) => {
      values.forEach(({value}) => {
        min = Math.min(value, min);
        max = Math.max(value, max);
      });
    });
    return [min, max];
  }
);

export const getCmTimelineMargins = createSelector(
  rootSelector,
  state => MARGINS
);

export const getCmTimelineLayoutSize = createSelector(
  [getCmSelectedFeatureTimelineWindowSize, getCmTimelineMargins],
  ([windowWidth, windowHeight], [ml, mt, mr, mb]) => [
    windowWidth - ml - mr,
    HEIGHT
  ]
);

export const getCmTimelineLayout = createSelector(
  [
    getCmTimelines,
    getCmTimelineYearDomain,
    getCmTimelineTradeValueDomain,
    getCmTimelineStabilityValueDomain,
    getCmTimelineLayoutSize,
    getCmTimelineMargins
  ],
  (
    timelines,
    yearDomain,
    tradeDomain,
    stabilityDomain,
    [width, height],
    [ml, mt, mr, mb]
  ) => {
    if (!yearDomain) {
      return [];
    }
    const yscale = scaleLinear()
      .domain(yearDomain)
      .range([ml, width]);
    const [tscale, sscale] = [tradeDomain, stabilityDomain].map(
      d =>
        d &&
        scaleLinear()
          .domain(d)
          .range([HEIGHT - mb, mt])
    );
    const [tline, sline] = [tscale, sscale].map(
      scale =>
        scale ||
        d3Line()
          .x(d => yscale(d.year))
          .y(d => scale(d.value))
          .curve(curveCardinal)
    );
    const colorScale = scaleOrdinal(schemeCategory10);
    return timelines.map(({id, values}, index) => {
      const line = id === 'stability' ? sline : tline;
      return {
        id,
        values,
        path: line(values),
        color: colorScale(index)
      };
    });
  }
);

export const getCmTimelineYearAxisTicks = createSelector(
  [getCmTimelineYearDomain, getCmTimelineLayoutSize, getCmTimelineMargins],
  (domain, [width, height], [ml, mt, mr, mb]) => {
    if (!domain) {
      return [];
    }
    const scale = scaleLinear()
      .domain(domain)
      .range([ml, width]);
    return d3Range(...domain).map(value => ({
      value,
      position: [value, HEIGHT - mb]
    }));
  }
);

export const getCmTimelineTradeAxisTicks = createSelector(
  [
    getCmTimelineTradeValueDomain,
    getCmTimelineLayoutSize,
    getCmTimelineMargins
  ],
  (domain, [width, height], [ml, mt, mr, mb]) => {
    if (!domain) {
      return [];
    }
    const scale = scaleLinear()
      .domain(domain)
      .range([HEIGHT - mb, mt]);
    return d3Range(...domain).map(value => ({
      value,
      position: [ml, value]
    }));
  }
);

export const getCmTimelineStabilityAxisTicks = createSelector(
  [
    getCmTimelineStabilityValueDomain,
    getCmTimelineLayoutSize,
    getCmTimelineMargins
  ],
  (domain, [width, height], [ml, mt, mr, mb]) => {
    if (!domain) {
      return [];
    }
    const scale = scaleLinear()
      .domain(domain)
      .range([HEIGHT - mb, mt]);
    return d3Range(...domain).map(value => ({
      value,
      position: [ml + width, value]
    }));
  }
);

export const getCmTimelineViewLayout = createSelector(
  [
    getCmTimelineLayout,
    getCmTimelineYearAxisTicks,
    getCmTimelineTradeAxisTicks,
    getCmTimelineStabilityAxisTicks
  ],
  (timelines, yearTicks, tradeTicks, stabilityTicks) => ({
    timelines,
    yearTicks,
    tradeTicks,
    stabilityTicks
  })
);
