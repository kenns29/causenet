import {createSelector} from 'reselect';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential} from 'd3-scale';
import {interpolateGreys} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {rootSelector} from '../base';
import {getRawModifiedBayesianNetwork} from './raw';

const BAYESIAN_NETWORK_MATRIX_PADDINGS = [100, 100];
const BAYESIAN_NETWORK_MATRIX_CELL_SIZE = [20, 20];

/**
 * Obtain the Bayesian Network in matrix form. The resulting matrix is flattened
 * @param {Array} rawBayesianNetwork
 * @return {Object} the flattened matrix:
 * rows: matrix rows -- Array of labels
 * cols: matrix columns -- Array of labels
 * cells: matrix cells -- Array of cells
 */
export const getMatrix = createSelector(getRawModifiedBayesianNetwork, data => {
  const generate = links2generator()
    .links(data)
    .source(d => d.source)
    .target(d => d.target)
    .value(d => d.weight)
    .null(0);
  const matrix = sort2d(generate());
  const {rows, cols, cells} = flattener().matrix(matrix);
  return {rows: rows(), cols: cols(), cells: cells()};
});

export const getMatrixDomain = createSelector(
  getMatrix,
  ({rows, cols, cells}) => {
    let [min, max] = [Infinity, -Infinity];
    cells.forEach(({value}) => {
      if (min > value) {
        min = value;
      }
      if (max < value) {
        max = value;
      }
    });
    return [min, max];
  }
);

export const getMatrixPaddings = createSelector(
  rootSelector,
  state => BAYESIAN_NETWORK_MATRIX_PADDINGS
);

export const getMatrixCellSize = createSelector(
  rootSelector,
  state => BAYESIAN_NETWORK_MATRIX_CELL_SIZE
);

/**
 * Obtain the Bayesian Network matrix layout
 */
export const getMatrixLayout = createSelector(
  [getMatrix, getMatrixCellSize, getMatrixDomain],
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
