import {createSelector} from 'reselect';
import {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential} from 'd3-scale';
import {interpolateGreys} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {
  array2Object,
  isCrBayesianNetwork,
  getPathLinksThroughNode
} from '../../utils';
import {rootSelector} from '../base';
import {
  getRawCrRelations,
  getRawCrRelationFeatures,
  getRawBayesianNetwork,
  getRawCrMatrixFocus
} from './raw';

const CELL_SIZE = [20, 20];
const PADDINGS = [100, 100];

const getMatrixObject = createSelector(getRawCrRelations, crRelations => {
  if (!crRelations.length) {
    return null;
  }
  const generate = links2generator()
    .links(crRelations)
    .source(d => d.source)
    .target(d => d.target)
    .value(d => Math.log(d.value || 0.1))
    .null(0);
  return generate();
});

const getRelationFeatureIdToNameMap = createSelector(
  getRawCrRelationFeatures,
  features => array2Object(features, d => d.id, d => d.name)
);

export const getCrBayesianNetwork = createSelector(
  [getRawBayesianNetwork, getMatrixObject],
  (network, matrix) => {
    if (!isCrBayesianNetwork(network)) {
      return [];
    }
    const rowSet = new Set(matrix.row_id_order().map(d => d.toString()));
    const colSet = new Set(matrix.col_id_order().map(d => d.toString()));
    return network.filter(({source, target}) => {
      const [sf, tf] = [source, target].map(
        d => d.split(',')[0].match(/\w+/)[0]
      );
      return rowSet.has(sf) && colSet.has(tf);
    });
  }
);

export const getFocusedCrBayesianNetwork = createSelector(
  [getCrBayesianNetwork, getRawCrMatrixFocus],
  (network, focus) => {
    if (!focus) {
      return network;
    }
    return getPathLinksThroughNode(focus, network);
  }
);

const getCleanedCrBayesianNetwork = createSelector(
  getFocusedCrBayesianNetwork,
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

const getCrBayesianNetworkFeatureSets = createSelector(
  getCleanedCrBayesianNetwork,
  network => {
    const [rowSet, colSet] = [new Set(), new Set()];
    network.forEach(({source, target}) => {
      [source, target].forEach(([f, u]) => {
        if (u) {
          colSet.add(f.toString());
        } else {
          rowSet.add(f.toString());
        }
      });
    });
    return [rowSet, colSet];
  }
);

export const getRelationMatrix = createSelector(
  [
    getMatrixObject,
    getRelationFeatureIdToNameMap,
    getCleanedCrBayesianNetwork,
    getCrBayesianNetworkFeatureSets
  ],
  (matrix, id2Name, network, [rowSet, colSet]) => {
    if (!matrix || Object.keys(id2Name).length === 0) {
      return {rows: [], cols: [], cells: []};
    }
    if (network.length) {
      matrix.row_id_order().forEach(id => {
        if (rowSet.has(id.toString())) {
          matrix.activate_row_by_id(id);
        } else {
          matrix.deactivate_row_by_id(id);
        }
      });
      matrix.col_id_order().forEach(id => {
        if (colSet.has(id.toString())) {
          matrix.activate_col_by_id(id);
        } else {
          matrix.deactivate_col_by_id(id);
        }
      });
    }
    const {rows, cols, cells} = flattener().matrix(sort2d(matrix));
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

export const getCrRowBayesianNetwork = createSelector(
  getCleanedCrBayesianNetwork,
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
  getCleanedCrBayesianNetwork,
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

/**
 * returns {
 *  source: [feature, u],
 *  target: [feature, u],
 *  value
 * }
 */
export const getCrCrossBayesianNetwork = createSelector(
  getCleanedCrBayesianNetwork,
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
        source,
        target
      }));
  }
);

export const getCrRowBayesianNetworkLayout = createSelector(
  [getCrRowBayesianNetwork, getRelationMatrixLayout],
  (network, {rows}) => {
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

export const getCrColBayesianNetworkLayout = createSelector(
  [getCrColBayesianNetwork, getRelationMatrixLayout],
  (network, {cols}) => {
    const nodeMap = array2Object(
      cols,
      d => d.id,
      ({x, y, ...d}, index) => ({...d, x, y: y - 20, index})
    );
    return network.map(({source, target, ...rest}) => {
      const [sn, tn] = [source, target].map(d => nodeMap[d]);
      const [sx, sy, tx, ty] = [sn.x, sn.y, tn.x, tn.y];
      const r = Math.abs(sn.index - tn.index) * 10;
      return {
        ...rest,
        source: sn,
        target: tn,
        points: [[sx, sy], [sx, sy - r], [tx, ty - r], [tx, ty]]
      };
    });
  }
);

export const getCrCrossBayesianNetworkLayout = createSelector(
  [getCrCrossBayesianNetwork, getRelationMatrixLayout],
  (network, {rows, cols}) => {
    const maps = [rows, cols].map((nodes, u) =>
      array2Object(
        nodes,
        d => d.id,
        ({x, y, ...d}, index) => ({
          ...d,
          x: u ? x : x - 20,
          y: u ? y - 20 : y,
          index,
          u
        })
      )
    );
    return network.map(({source, target, ...rest}) => {
      const [[sn, su], [tn, tu]] = [source, target].map(([k, u]) => [
        maps[u][k],
        u
      ]);
      const [sx, sy, tx, ty] = [sn.x, sn.y, tn.x, tn.y];
      const [rx, ry] = [sn, tn].map(d => (d.index + 1) * 10);
      return {
        ...rest,
        source: sn,
        target: tn,
        points: su
          ? [
            [sx, sy],
            [sx, sy - ry],
            [tx - rx, sy - ry],
            [tx - rx, ty],
            [tx, ty]
          ]
          : [
            [sx, sy],
            [sx - rx, sy],
            [sx - rx, ty - ry],
            [tx, ty - ry],
            [tx, ty]
          ]
      };
    });
  }
);
