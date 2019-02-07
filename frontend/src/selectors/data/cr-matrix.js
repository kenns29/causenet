import {createSelector} from 'reselect';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential} from 'd3-scale';
import {interpolateGreys} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {array2Object, isCrBayesianNetwork} from '../../utils';
import {rootSelector} from '../base';
import {
  getRawCrRelations,
  getRawCrRelationFeatures,
  getRawBayesianNetwork
} from './raw';

const CELL_SIZE = [20, 20];
const PADDINGS = [100, 100];

const getRelationFeatureIdToNameMap = createSelector(
  getRawCrRelationFeatures,
  features => array2Object(features, d => d.id, d => d.name)
);

export const getRelationMatrix = createSelector(
  [getRawCrRelations, getRelationFeatureIdToNameMap],
  (crRelations, id2Name) => {
    if (crRelations.length === 0 || Object.keys(id2Name).length === 0) {
      return {rows: [], cols: [], cells: []};
    }
    const generate = links2generator()
      .links(crRelations)
      .source(d => d.source)
      .target(d => d.target)
      .value(d => Math.log(d.value || 0.1))
      .null(0);

    const matrix = sort2d(generate());
    const {rows, cols, cells} = flattener().matrix(matrix);

    return {
      rows: rows().map(id => ({id, name: id2Name[id]})),
      cols: cols().map(id => ({id, name: id2Name[id]})),
      cells: cells()
    };
  }
);

export const getRelationMatrixDomain = createSelector(
  getRelationMatrix,
  ({rows, cols, cells}) =>
    cells.reduce(
      ([min, max], {value}) => [Math.min(min, value), Math.max(max, value)],
      [Infinity, -Infinity]
    )
);

export const getRelationMatrixPaddings = createSelector(
  rootSelector,
  state => PADDINGS
);

export const getRelationMatrixCellSize = createSelector(
  rootSelector,
  state => CELL_SIZE
);

export const getRelationMatrixLayout = createSelector(
  [
    getRelationMatrix,
    getRelationMatrixCellSize,
    getRelationMatrixPaddings,
    getRelationMatrixDomain
  ],
  ({rows, cols, cells}, [w, h], [pv, ph], [min, max]) => {
    const scale = scaleSequential(interpolateGreys).domain([0, max]);
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

export const getCrBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return network;
    }
    return network.map(({source, target, ...rest}) => {
      const [s, t] = [source, target].map(d => {
        const [f, t] = d.split(',').map(d => d.match(/\w+/)[0]);
        return [f, Number(t)];
      });
      return {
        ...rest,
        source: s,
        target: t
      };
    });
  }
);

export const getFilteredCrBayesianNetwork = createSelector(
  [getCrBayesianNetwork, getRelationMatrix],
  (network, {rows, cols}) => {
    const featureSet = new Set([...rows, ...cols].map(d => d.id.toString()));
    return network.filter(({source, target}) =>
      [source, target].every(d => featureSet.has(d[0].toString()))
    );
  }
);

export const getCrRowBayesianNetwork = createSelector(
  getFilteredCrBayesianNetwork,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return network;
    }
    return network
      .filter(({source, target}) => [source, target].every(d => d[1] === 0))
      .map(({source, target, ...rest}) => ({
        ...rest,
        source: source[0],
        target: target[0]
      }));
  }
);

export const getCrColBayesianNetwork = createSelector(
  getFilteredCrBayesianNetwork,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return network;
    }
    return network
      .filter(({source, target}) => [source, target].every(d => d[1] === 1))
      .map(({source, target, ...rest}) => ({
        ...rest,
        source: source[0],
        target: target[0]
      }));
  }
);

export const getCrCrossBayesianNetwork = createSelector(
  getFilteredCrBayesianNetwork,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return [];
    }
    return network
      .filter(({source, target}) =>
        [source, target].reduce((a, b) => a[1] !== b[1])
      )
      .map(({source, target, ...rest}) => ({
        ...rest,
        source: source[0],
        target: target[0]
      }));
  }
);

export const getCrRowBayesianNetworkLayout = createSelector(
  [getCrRowBayesianNetwork, getRelationMatrixLayout, getRelationMatrixCellSize],
  (network, {rows}, [w, h]) => {
    const nodeMap = array2Object(
      rows,
      d => d.id,
      ({x, y, ...d}, index) => ({...d, x: x - 20, y, index})
    );
    return network.map(({source, target, ...rest}) => {
      const [sn, tn] = [source, target].map(d => nodeMap[d]);
      const [sx, sy, tx, ty] = [sn.x, sn.y, tn.x, tn.y];
      const r = Math.abs(sn.index - tn.index) * 10;
      return {
        ...rest,
        source: sn,
        target: tn,
        points: [[sx, sy], [sx - r, sy], [tx - r, ty], [tx, ty]]
      };
    });
  }
);
