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
    .value(d => d.value)
    .null(0);
  return generate().cell_value(d => Math.log(d || 0.1));
});

export const getCrRelationFeatureIdToNameMap = createSelector(
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
        source,
        target,
        csource: s,
        ctarget: t
      };
    });
  }
);

const getCrBayesianNetworkFeatureSets = createSelector(
  getCleanedCrBayesianNetwork,
  network => {
    const [rowSet, colSet] = [new Set(), new Set()];
    network.forEach(({csource, ctarget}) => {
      [csource, ctarget].forEach(([f, u]) => {
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
    getCrRelationFeatureIdToNameMap,
    getCrBayesianNetworkFeatureSets
  ],
  (matrix, id2Name, [rowSet, colSet]) => {
    if (!matrix || Object.keys(id2Name).length === 0) {
      return {rows: [], cols: [], cells: []};
    }
    if (rowSet.size || colSet.size) {
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

const getCrBayesianNetworkPreLayout = createSelector(
  [getCleanedCrBayesianNetwork, getRelationMatrix],
  (network, {rows, cols}) => {
    // get id to index
    const nodeId2Index = {};
    rows.forEach(({id}, i) => {
      nodeId2Index[`(${id}, ${0})`] = rows.length - i - 1;
    });
    cols.forEach(({id}, i) => {
      nodeId2Index[`(${id}, ${1})`] = i;
    });

    // network
    network.forEach(link => {
      const {source, target} = link;
      link.id = `${source}-${target}`;
    });
    const links = network.map(({source, target, ...rest}) => {
      const id = `${source}-${target}`;
      const sourceIndex = nodeId2Index[source];
      const targetIndex = nodeId2Index[target];
      const dist = Math.abs(sourceIndex - targetIndex);
      return {
        ...rest,
        id,
        source,
        target,
        sourceIndex,
        targetIndex,
        dist
      };
    });

    // sort edges
    links.sort((a, b) => a.dist - b.dist);

    // [{
    //  range: [s, t],
    //  h
    // }]
    const overlaps = [];
    const bins = Array(rows.length + cols.length)
      .fill(0)
      .map(_ => [[], []]);

    const getOverlap = (link, overlaps) => {
      const {sourceIndex, targetIndex} = link;
      for (const o of overlaps) {
        const {
          range: [s, t]
        } = o;
        if (sourceIndex < targetIndex) {
          if (targetIndex < s && targetIndex >= t) {
            return o;
          }
        } else if (targetIndex <= s && targetIndex < t) {
          return o;
        }
      }
      return null;
    };

    links.forEach(link => {
      const {sourceIndex, targetIndex} = link;
      const overlap = getOverlap(link, overlaps);
      if (overlap) {
        link.h = overlap.h = overlap.h + 1;
        const [s, t] = overlap.range;
        overlap.range = [
          Math.min(sourceIndex, targetIndex, s),
          Math.max(sourceIndex, targetIndex, t)
        ];
      } else {
        link.h = 1;
        overlaps.push({
          range: [
            Math.min(sourceIndex, targetIndex),
            Math.max(sourceIndex, targetIndex)
          ],
          h: 1
        });
      }
      bins[sourceIndex][0].push(link);
      bins[targetIndex][1].push(link);
    });

    bins.forEach(bin => {
      const bn = bin[0].length + bin[1].length;
      bin[0].sort((a, b) => a.h - b.h).forEach((link, i) => {
        link.dir = 0;
        link.bi = i;
        link.bn = bn;
      });
      bin[1].sort((a, b) => a.h - b.h).forEach((link, i) => {
        link.dir = 0;
        link.bi = i;
        link.bn = bn;
      });
    });
    return links;
  }
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
  getCrBayesianNetworkPreLayout,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return network;
    }
    return network
      .filter(({csource, ctarget}) => [csource, ctarget].every(d => d[1] === 0))
      .map(({csource, ctarget, ...rest}) => ({
        ...rest,
        source: csource[0],
        target: ctarget[0],
        csource,
        ctarget
      }));
  }
);

export const getCrColBayesianNetwork = createSelector(
  getCrBayesianNetworkPreLayout,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return network;
    }
    return network
      .filter(({csource, ctarget}) => [csource, ctarget].every(d => d[1] === 1))
      .map(({csource, ctarget, ...rest}) => ({
        ...rest,
        source: csource[0],
        target: ctarget[0],
        csource,
        ctarget
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
  getCrBayesianNetworkPreLayout,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return [];
    }
    return network
      .filter(({csource, ctarget}) =>
        [csource, ctarget].reduce((a, b) => a[1] !== b[1])
      )
      .map(({csource, ctarget, ...rest}) => ({
        ...rest,
        source: csource,
        target: ctarget,
        csource,
        ctarget
      }));
  }
);

export const getCrRowBayesianNetworkLayout = createSelector(
  [getCrRowBayesianNetwork, getRelationMatrixLayout, getRelationMatrixCellSize],
  (network, {rows}, [cw, ch]) => {
    const nodeMap = array2Object(
      rows,
      d => d.id,
      ({x, y, ...d}, index) => ({...d, x: x - 20, y, index})
    );
    return network.map(({source, target, corr, h, bi, dir, bn, ...rest}) => {
      const [sn, tn] = [source, target].map(d => nodeMap[d]);
      const [sx, tx] = [sn.x, tn.x];
      const sy =
        dir === 0
          ? sn.y - ch / 2 + (ch / bn) * bi
          : sn.y + ch / 2 - (ch / bn) * bi;
      const ty =
        dir === 0
          ? tn.y + ch / 2 - (ch / bn) * bi
          : tn.y - ch / 2 + (ch / bn) * bi;
      // const [sx, sy, tx, ty] = [sn.x, sn.y, tn.x, tn.y];
      const r = h * 10;
      return {
        ...rest,
        source: sn,
        target: tn,
        points: [[sx, sy], [sx - r, sy], [tx - r, ty], [tx, ty]],
        corr,
        color: corr >= 0 ? [0, 0, 200] : [200, 0, 0]
      };
    });
  }
);

export const getCrColBayesianNetworkLayout = createSelector(
  [getCrColBayesianNetwork, getRelationMatrixLayout, getRelationMatrixCellSize],
  (network, {cols}, [cw, ch]) => {
    const nodeMap = array2Object(
      cols,
      d => d.id,
      ({x, y, ...d}, index) => ({...d, x, y: y - 20, index})
    );
    return network.map(({source, target, corr, h, bi, dir, bn, ...rest}) => {
      const [sn, tn] = [source, target].map(d => nodeMap[d]);
      const [sy, ty] = [sn.y, tn.y];
      // const [sx, sy, tx, ty] = [sn.x, sn.y, tn.x, tn.y];
      const sx =
        dir === 0
          ? sn.x + cw / 2 - (cw / bn) * bi
          : sn.x - cw / 2 + (cw / bn) * bi;
      const tx =
        dir === 0
          ? tn.x - cw / 2 + (cw / bn) * bi
          : tn.x + cw / 2 - (cw / bn) * bi;
      const r = h * 10;
      return {
        ...rest,
        source: sn,
        target: tn,
        points: [[sx, sy], [sx, sy - r], [tx, ty - r], [tx, ty]],
        corr,
        color: corr >= 0 ? [0, 0, 200] : [200, 0, 0]
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
    return network.map(({source, target, corr, h, bi, dir, ...rest}) => {
      const [[sn, su], [tn, tu]] = [source, target].map(([k, u]) => [
        maps[u][k],
        u
      ]);
      const [sx, sy, tx, ty] = [sn.x, sn.y, tn.x, tn.y];
      // const [rx, ry] = [sn, tn].map(d => (d.index + 1) * 10);
      const [rx, ry] = [h * 10, h * 10];
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
          ],
        corr,
        color: corr >= 0 ? [0, 0, 200] : [200, 0, 0]
      };
    });
  }
);
