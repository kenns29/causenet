import {createSelector} from 'reselect';
import {line as d3Line, curveCardinal} from 'd3-shape';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {range as d3Range} from 'd3-array';
import {schemeCategory10} from 'd3-scale-chromatic';
import {format as d3Format} from 'd3-format';
import {rootSelector, getCmSelectedFeatureTimelineWindowSize} from '../base';
import {
  getRawCmSelectedFeatureTimelineData,
  getRawCountries,
  getRawItems
} from './raw';
import {makeTextLengthComputer, array2Object} from '../../utils';

const MARGINS = [60, 80, 60, 30];
const HEIGHT = 300;

const idToCid = id => {
  const p = id.split(',').map(g => g.match(/-?\w+/)[0]);
  if (p.length > 2) {
    return [p[0], p[1], Number(p[2])];
  }
  if (p.length > 1) {
    return [p[0], null, Number(p[1])];
  }
  return [p[0], null, null];
};

const getCmTimelines = createSelector(
  getRawCmSelectedFeatureTimelineData,
  data =>
    Object.entries(data).map(([id, valueMap]) => ({
      id,
      values: Object.entries(valueMap).map(([year, value]) => ({
        year: Number(year),
        value
      }))
    }))
);

export const getCmTimelineYearDomain = createSelector(
  getCmTimelines,
  timelines => {
    if (timelines.length === 0) {
      return null;
    }
    return timelines[0].values.reduce(
      ([min, max], {year}) => [Math.min(min, year), Math.max(max, year)],
      [Infinity, -Infinity]
    );
  }
);

export const getCmTimelineTradeValueDomain = createSelector(
  getCmTimelines,
  timelines => {
    const tls = timelines.filter(({id}) => {
      const c = idToCid(id)[1];
      return c !== '-1';
    });
    if (tls.length === 0) {
      return null;
    }
    let [min, max] = [Infinity, -Infinity];
    tls.forEach(({values}) => {
      values.forEach(({value}) => {
        min = Math.min(value, min);
        max = Math.max(value, max);
      });
    });
    return [min, max];
  }
);

export const getCmTimelineStabilityValueDomain = createSelector(
  getCmTimelines,
  timelines => {
    const tls = timelines.filter(({id}) => {
      const c = idToCid(id)[1];
      return c === '-1';
    });
    if (tls.length === 0) {
      return null;
    }
    let [min, max] = [Infinity, -Infinity];
    tls.forEach(({values}) => {
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
      .range([ml, ml + width]);
    const [tscale, sscale] = [tradeDomain, stabilityDomain].map(
      d =>
        d &&
        scaleLinear()
          .domain(d)
          .range([height + mt, mt])
    );
    const [tline, sline] = [tscale, sscale].map(
      scale =>
        scale &&
        d3Line()
          .x(d => yscale(d.year))
          .y(d => scale(d.value))
    );
    const colorScale = scaleOrdinal(schemeCategory10);
    return timelines.map(({id, values}, index) => {
      const c = idToCid(id)[1];
      const line = c === '-1' ? sline : tline;
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
      .range([ml, ml + width]);
    return d3Range(domain[0], domain[1] + 1).map(value => ({
      value,
      position: [scale(value), mt + height],
      label: value.toString()
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
      .range([height + mt, mt]);
    const format = d3Format('~s');
    return scale.ticks(10).map(value => ({
      value,
      position: [ml, scale(value)],
      label: format(value)
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
      .range([height + mt, mt]);
    const format = d3Format('.2f');
    return scale.ticks(10).map(value => ({
      value,
      position: [ml + width, scale(value)],
      label: format(value)
    }));
  }
);

const getFIdToName = createSelector(getRawCountries, countries =>
  array2Object(countries, d => d.country_code, d => d.long_name)
);

const getCIdToName = createSelector(getRawItems, items =>
  array2Object(items, d => d.item_code, d => d.item)
);

export const getCmTimelineLegend = createSelector(
  [
    getCmTimelines,
    getCmTimelineLayoutSize,
    getCmTimelineMargins,
    getFIdToName,
    getCIdToName
  ],
  (timelines, [width, height], [ml, mt, mr, mb], fIdToName, cIdToName) => {
    const fontSize = 12;
    const computeTextLength = makeTextLengthComputer({fontSize});
    const [trade, stability] = [[], []];
    const colorScale = scaleOrdinal(schemeCategory10);
    timelines.forEach(({id, values}, index) => {
      const [f, c, u] = idToCid(id);
      const fname = fIdToName[f];
      if (c === '-1') {
        stability.push({
          id,
          label: `${fname}, stability`,
          color: colorScale(index)
        });
      } else {
        const cname = c !== null ? cIdToName[c] : null;
        const uname = u !== null ? (u === 0 ? 'Export' : 'Import') : null;
        let label = fname;
        if (cname) {
          label += `, ${cname}`;
        }
        if (uname) {
          label += `, ${uname}`;
        }
        trade.push({
          id,
          label,
          color: colorScale(index)
        });
      }
    });

    const [w, h] = [12, 12];
    let [x, y] = [ml, mt / 2 - h / 2];

    trade.forEach((d, i) => {
      d.position = [x + 3, y];
      d.textOffest = 2;
      d.size = [w, h];
      d.fontSize = fontSize;
      x += 3 + w + 2 + computeTextLength(d.label);
    });

    x += 20;

    stability.forEach((d, i) => {
      d.position = [x + 3, y];
      d.textOffest = 2;
      d.size = [w, h];
      d.fontSize = fontSize;
      x += 3 + w + 2 + computeTextLength(d.label);
    });

    return {
      trade,
      stability
    };
  }
);

export const getCmTimelineViewLayout = createSelector(
  [
    getCmTimelineLayout,
    getCmTimelineYearAxisTicks,
    getCmTimelineTradeAxisTicks,
    getCmTimelineStabilityAxisTicks,
    getCmTimelineLegend
  ],
  (timelines, yearTicks, tradeTicks, stabilityTicks, legend) => ({
    timelines,
    yearTicks,
    tradeTicks,
    stabilityTicks,
    legend
  })
);
