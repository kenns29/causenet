import {createSelector} from 'reselect';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential} from 'd3-scale';
import {interpolateGreys} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {rootSelector} from '../base';
import {getRawCrRelations} from './raw';

const CELL_SIZE = [20, 20];
const PADDINGS = [100, 100];

export const getRelationMatrix = createSelector(
  getRawCrRelations,
  crRelations => {
    const generate = links2generator()
      .links(crRelations)
      .source(d => d.source)
      .target(d => d.target)
      .value(d => Math.log(d.value || 0.1))
      .null(0);

    const matrix = sort2d(generate());
    const {rows, cols, cells} = flattener().matrix(matrix);
    return {rows: rows(), cols: cols(), cells: cells()};
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
  [getRelationMatrix, getRelationMatrixCellSize, getRelationMatrixDomain],
  ({rows, cols, cells}, [w, h], [min, max]) => {
    const scale = scaleSequential(interpolateGreys).domain([0, max]);
    return {
      rows,
      cols,
      cells: cells.map(cell => {
        const {r, g, b} = rgb(scale(cell.value));
        return {
          ...cell,
          x: cell.col_index * w,
          y: cell.row_index * h,
          w,
          h,
          color: [r, g, b]
        };
      })
    };
  }
);
