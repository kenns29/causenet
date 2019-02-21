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
      // const [sf, tf] = [source, target].map(
      //   d => d.split(',')[0].match(/\w+/)[0]
      // );
      const [[sf, sc, su], [tf, tc, tu]] = [source, target].map(d => {
        const p = d.split(',').map(g => g.match(/\w+/)[0]);
        return p.length > 2
          ? [p[0], p[1], Number(p[2])]
          : [p[0], '1', Number(p[1])];
      });

      return rowSet.has(sf) && colSet.has(tf) && tc === '1' && sc === '1';
    });
  }
);

export const getFocusedCrBayesianNetwork = createSelector(
  [getCrBayesianNetwork, getRawCrMatrixFocus],
  (network, focus) => {
    if (network.length === 0) {
      return [];
    }
    if (!focus) {
      return network;
    }
    const p = network[0].source.split(',').map(g => g.match(/\w+/)[0]);
    const foc =
      p.length > 2
        ? `(${focus[0]}, ${p[1]}, ${focus[1]})`
        : `(${focus[0]}, ${focus[1]})`;
    return getPathLinksThroughNode(foc, network);
  }
);

const getCleanedCrBayesianNetwork = createSelector(
  getFocusedCrBayesianNetwork,
  network => {
    if (!isCrBayesianNetwork(network)) {
      return network;
    }
    return network.map(({source, target, ...rest}) => {
      // const [s, t] = [source, target].map(d => {
      //   const [f, t] = d.split(',').map(d => d.match(/\w+/)[0]);
      //   return [f, Number(t)];
      // });
      const [s, t] = [source, target].map(d => {
        const p = d.split(',').map(g => g.match(/\w+/)[0]);
        return p.length > 2
          ? [p[0], p[1], Number(p[2])]
          : [p[0], '1', Number(p[1])];
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
      [csource, ctarget].forEach(([f, c, u]) => {
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
    if (network.length === 0) {
      return [];
    }

    const nodeId2Index = {};
    rows.forEach(({id}, i) => {
      nodeId2Index[`(${id}, ${0})`] = rows.length - i - 1;
    });
    cols.forEach(({id}, i) => {
      nodeId2Index[`(${id}, ${1})`] = rows.length + i;
    });

    network.forEach(link => {
      const {source, target} = link;
      link.id = `${source}-${target}`;
    });
    const links = network.map(({source, target, csource, ctarget, ...rest}) => {
      const id = `${source}-${target}`;
      const [[sf, sc, su], [tf, tc, tu]] = [csource, ctarget];
      const sourceIndex = nodeId2Index[`(${sf}, ${su})`];
      const targetIndex = nodeId2Index[`(${tf}, ${tu})`];
      const dist = Math.abs(sourceIndex - targetIndex);
      return {
        ...rest,
        id,
        source,
        target,
        csource,
        ctarget,
        sourceIndex,
        targetIndex,
        dist
      };
    });

    links.sort((a, b) => a.dist - b.dist);

    /** [{
     *    id,
     *    range: [s, t],
     *    h
     * }]
     */
    let bounds = [];
    const bins = Array(rows.length + cols.length)
      .fill(0)
      .map(_ => [[], []]);

    const findOverlaps = (link, bounds) => {
      const {sourceIndex, targetIndex} = link;
      const [s, t] = [
        Math.min(sourceIndex, targetIndex),
        Math.max(sourceIndex, targetIndex)
      ];
      const overlaps = [];
      bounds.forEach(bound => {
        const {
          range: [rs, rt],
          h
        } = bound;
        if (s <= rt && t >= rs) {
          overlaps.push(bound);
        }
      });
      return overlaps;
    };

    links.forEach(link => {
      const {sourceIndex, targetIndex} = link;
      const overlaps = findOverlaps(link, bounds);
      let [ms, mt] = [
        Math.min(sourceIndex, targetIndex),
        Math.max(sourceIndex, targetIndex)
      ];
      if (overlaps.length) {
        const oSet = new Set();
        let mh = 1;
        overlaps.forEach(({id, range: [rs, rt], h}) => {
          oSet.add(id);
          [ms, mt, mh] = [Math.min(ms, rs), Math.max(mt, rt), Math.max(mh, h)];
        });
        bounds = bounds.filter(b => !oSet.has(b.id));
        bounds.push({
          id: `${ms}-${mt}`,
          range: [ms, mt],
          h: mh + 1
        });
        link.h = mh + 1;
      } else {
        bounds.push({
          id: `${ms}-${mt}`,
          range: [ms, mt],
          h: 1
        });
        link.h = 1;
      }
      bins[sourceIndex][0].push(link);
      bins[targetIndex][1].push(link);
      link.dir = sourceIndex <= targetIndex ? 0 : 1;
    });

    bins.forEach(bin => {
      const [bn0, bn1] = bin.map(d => d.length);
      const bn = bn0 + bn1;
      bin[0].sort((a, b) => a.h - b.h).forEach((link, i) => {
        link.sbi = i;
        link.sbn = bn;
        link.sbn0 = bn0;
        link.sbn1 = bn1;
      });
      bin[1].sort((a, b) => a.h - b.h).forEach((link, i) => {
        link.tbi = bn0 + i;
        link.tbn = bn;
        link.tbn0 = bn0;
        link.tbn1 = bn1;
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
      .filter(({csource, ctarget}) => [csource, ctarget].every(d => d[2] === 0))
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
      .filter(({csource, ctarget}) => [csource, ctarget].every(d => d[2] === 1))
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
        [csource, ctarget].reduce((a, b) => a[2] !== b[2])
      )
      .map(({csource, ctarget, ...rest}) => ({
        ...rest,
        source: csource[0],
        target: ctarget[0],
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
    return network.map(
      ({source, target, corr, h, dir, sbi, sbn, tbi, tbn, ...rest}) => {
        const sitv = sbn > 1 ? Math.min(2, (ch - 2) / sbn) : 0;
        const titv = tbn > 1 ? Math.min(2, (ch - 2) / tbn) : 0;
        const [sbs, tbs] = [sitv * sbn, titv * tbn];
        const [sn, tn] = [source, target].map(d => nodeMap[d]);
        const [sx, tx] = [sn.x, tn.x];

        const sy = sn.y + sbs / 2 - sitv * sbi;
        const ty = tn.y + tbs / 2 - titv * tbi;
        const r = h * 5;
        return {
          ...rest,
          source: sn,
          target: tn,
          points: [[sx, sy], [sx - r, sy], [tx - r, ty], [tx, ty]],
          corr,
          color: corr >= 0 ? [0, 0, 200] : [200, 0, 0]
        };
      }
    );
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
    return network.map(
      ({source, target, corr, h, dir, sbi, sbn, tbi, tbn, ...rest}) => {
        const sitv = sbn > 1 ? Math.min(2, (cw - 2) / sbn) : 0;
        const titv = tbn > 1 ? Math.min(2, (cw - 2) / tbn) : 0;
        const [sbs, tbs] = [sitv * sbn, titv * tbn];
        const [sn, tn] = [source, target].map(d => nodeMap[d]);
        const [sy, ty] = [sn.y, tn.y];

        const sx = sn.x - sbs / 2 + sitv * sbi;
        const tx = tn.x - tbs / 2 + titv * tbi;
        const r = h * 5;
        return {
          ...rest,
          source: sn,
          target: tn,
          points: [[sx, sy], [sx, sy - r], [tx, ty - r], [tx, ty]],
          corr,
          color: corr >= 0 ? [0, 0, 200] : [200, 0, 0]
        };
      }
    );
  }
);

export const getCrCrossBayesianNetworkLayout = createSelector(
  [
    getCrCrossBayesianNetwork,
    getRelationMatrixLayout,
    getRelationMatrixCellSize
  ],
  (network, {rows, cols}, [cw, ch]) => {
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
    return network.map(
      ({csource, ctarget, corr, h, dir, sbi, sbn, tbi, tbn, ...rest}) => {
        const sitv = sbn > 1 ? Math.min(2, ((dir ? cw : ch) - 2) / sbn) : 0;
        const titv = tbn > 1 ? Math.min(2, ((dir ? ch : cw) - 2) / tbn) : 0;
        const [sbs, tbs] = [sitv * sbn, titv * tbn];
        const [sn, tn] = [csource, ctarget].map(([k, _, u]) => maps[u][k]);

        const sx = dir ? sn.x - sbs / 2 + sitv * sbi : sn.x;
        const sy = dir ? sn.y : sn.y + sbs / 2 - sitv * sbi;
        const tx = dir ? tn.x : tn.x - tbs / 2 + titv * tbi;
        const ty = dir ? tn.y + tbs / 2 - titv * tbi : tn.y;
        const [rx, ry] = [h * 5, h * 5];
        return {
          ...rest,
          source: sn,
          target: tn,
          points: dir
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
      }
    );
  }
);
