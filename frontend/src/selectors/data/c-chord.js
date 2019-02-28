import {createSelector} from 'reselect';
import {document} from 'global';
import {chord, ribbon} from 'd3-chord';
import {descending as d3Descending} from 'd3-array';
import {links2generator} from 'sortable-matrix';
import {rootSelector} from '../base';
import {
  getRawCrRelations,
  getRawCrRelationFeatures,
  getRawBayesianNetwork,
  getRawCrMatrixFocus
} from './raw';
import {array2Object} from '../../utils';

export const getCcBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  network => {
    return network.map(({source, target, ...rest}) => {
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

export const getCcCategoryNetwork = createSelector(
  getCcBayesianNetwork,
  network => {
    const cmap = network.reduce((map, link) => {
      const {
        csource: [sf, sc, su],
        ctarget: [tf, tc, tu]
      } = link;
      const key = `${sc}-${tc}`;
      if (!map.hasOwnProperty(key)) {
        map[key] = {
          count: 0,
          source: sc,
          target: tc,
          links: []
        };
      }
      ++map[key].count;
      map[key].links.push(link);
      return map;
    }, {});

    return Object.entries(cmap).map(([id, link]) => ({id, ...link}));
  }
);

export const getCcCategoryMatrixObject = createSelector(
  getCcCategoryNetwork,
  network => {
    const generate = links2generator()
      .links(network)
      .source(d => Number(d.source))
      .target(d => Number(d.target))
      .value(d => d.count)
      .null(0);
    const mo = generate();
    const [rows, cols] = [mo.row_id_order(), mo.col_id_order()];
    mo.order_rows_by_id(rows.sort((a, b) => a - b));
    mo.order_cols_by_id(cols.sort((a, b) => a - b));
    return mo;
  }
);

export const getCcCategoryMatrix = createSelector(
  getCcCategoryMatrixObject,
  mo => {
    const [rows, cols] = [mo.active_row_id_order(), mo.active_col_id_order()];
    const matrix = rows.map(() => Array(cols.length));
    rows.forEach((row, ri) => {
      cols.forEach((col, ci) => {
        matrix[ri][ci] = mo.cell_value_by_id(row, col);
      });
    });
    return matrix;
  }
);

export const getCcLayout = createSelector(getCcCategoryMatrix, matrix => {
  console.log('matrix', matrix);
  const cGen = chord()
    .padAngle(0.05)
    .sortSubgroups(d3Descending);
  const chords = cGen(matrix);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const rGen = ribbon()
    .radius(200)
    .context(ctx);

  chords.forEach(d => {
    const p = rGen(d);
    console.log('p', p);
  });
});
