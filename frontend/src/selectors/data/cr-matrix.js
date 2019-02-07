import {createSelector} from 'reselect';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential} from 'd3-scale';
import {interpolateGreys} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {array2Object} from '../../utils';
import {rootSelector} from '../base';
import {getRawCrRelations, getRawCrRelationFeatures} from './raw';

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
