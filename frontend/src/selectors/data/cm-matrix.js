import {createSelector} from 'reselect';
import {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleDiverging} from 'd3-scale';
import {interpolateRdBu} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {array2Object} from '../../utils';
import {rootSelector} from '../base';
import {
  getRawCmCorrelations,
  getRawBayesianNetwork,
  getRawCountries,
  getRawItems
} from './raw';

const CELL_SIZE = [20, 20];
const PADDINGS = [100, 100];

const getCleanedBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  network =>
    network.map(({source, target, ...rest}) => {
      const [csource, ctarget] = [source, target].map(d => {
        const p = d.split(',').map(g => g.match(/-?\w+/)[0]);
        if (p.length > 2) {
          return [p[0], p[1], Number(p[2])];
        }
        if (p.length > 1) {
          return [p[0], '1', Number(p[1])];
        }
        return [p[0], '1', 0];
      });
      return {
        source,
        target,
        csource,
        ctarget,
        ...rest
      };
    })
);

export const getCmJointCorrelations = createSelector(
  [getRawCmCorrelations, getCleanedBayesianNetwork],
  (cmCorrelations, network) => {
    const corrs = cmCorrelations.map(({country, item, corr}) => ({
      country,
      item,
      corr,
      isSpurious: false,
      // 0 -- non-directional
      // 1 -- trade to social
      // -1 -- social to trade
      // 2 -- double direction
      direction: 0
    }));
    if (network.length) {
      const cmap = network
        .filter(({csource, ctarget}) => {
          const [[sf, sc, su], [tf, tc, tu]] = [csource, ctarget];
          return (
            sf === tf &&
            ((sc === '-1' && tu === 1) || (tc === '-1' && su === 1))
          );
        })
        .reduce((m, {csource, ctarget, ...rest}) => {
          const [[sf, sc, su], [tf, tc, tu]] = [csource, ctarget];
          const [country, item] = [sf, sc === '-1' ? tc : sc];
          const key = `${country}-${item}`;
          const direction = m.hasOwnProperty(key) ? 2 : sc === -1 ? -1 : 1;
          m[key] = {csource, ctarget, ...rest, direction};
          return m;
        }, {});
      corrs.forEach(corr => {
        const {country, item} = corr;
        const n = cmap.hasOwnProperty(`${country}-${item}`)
          ? cmap[`${country}-${item}`]
          : null;
        corr.isSpurious = !n;
        corr.direction = n ? n.direction : 0;
      });
    }
    return corrs;
  }
);

const getCmMatrixObject = createSelector(getCmJointCorrelations, corrs => {
  if (!corrs.length) {
    return null;
  }
  const generate = links2generator()
    .links(corrs)
    .source(d => d.country)
    .target(d => d.item)
    .value(({corr, isSpurious, direction}) => ({
      corr,
      isSpurious,
      direction
    }))
    .null({corr: 0, isSpurious: false, direction: 0});
  return generate().cell_value(d => d.corr);
});

const getCountryIdToName = createSelector(getRawCountries, countries =>
  array2Object(countries, d => d.country_code, d => d.country)
);

const getItemIdToName = createSelector(getRawItems, items =>
  array2Object(items, d => d.item_code, d => d.item)
);

const getCmMatrix = createSelector(
  [getCmMatrixObject, getCountryIdToName, getItemIdToName],
  (matrix, rid2Name, cid2Name) => {
    if (
      !matrix ||
      !Object.keys(rid2Name).length ||
      !Object.keys(cid2Name).length
    ) {
      return {rows: [], cols: [], cells: []};
    }
    const {rows, cols, cells} = flattener().matrix(sort2d(matrix));
    return {
      rows: rows().map(id => ({id, name: rid2Name[id]})),
      cols: cols().map(id => ({id, name: cid2Name[id]})),
      cells: cells()
    };
  }
);

export const getCmMatrixPaddings = createSelector(
  rootSelector,
  state => PADDINGS
);

export const getCmMatrixCellSize = createSelector(
  rootSelector,
  state => CELL_SIZE
);

export const getCmMatrixLayout = createSelector(
  [getCmMatrix, getCmMatrixCellSize, getCmMatrixPaddings],
  ({rows, cols, cells}, [w, h], [pv, ph]) => {
    const scale = scaleDiverging(interpolateRdBu).domain([-1, 0, 1]);
    return {
      rows: rows.map((d, i) => ({
        ...d,
        x: ph - 5,
        y: i * h + h / 2 + pv
      })),
      cols: cols.map((d, i) => ({
        ...d,
        x: i * w + w / 2 + ph,
        y: pv - 5
      })),
      cells: cells.map(cell => {
        const {r, g, b} = rgb(scale(cell.value));
        return {
          ...cell,
          x: cell.col_index * w + ph,
          y: cell.row_index * h + pv,
          w,
          h,
          color: [r, g, b]
        };
      })
    };
  }
);