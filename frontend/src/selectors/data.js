import {createSelector} from 'reselect';
import {rootSelector} from './base';
import {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential} from 'd3-scale';
import {interpolateGreys} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';

export const getRawData = createSelector(rootSelector, state => state.data);

export const getNodeLinks = createSelector(getRawData, data => {
  const nodeMap = data.reduce((map, {source, target}) => {
    return [source, target].reduce(
      (m, label) =>
        m.hasOwnProperty(label)
          ? m
          : Object.assign(m, {[label]: {label, width: 20, height: 20}}),
      map
    );
  }, {});
  const nodes = nodeMap.values();
  const links = data.map(({source, target}) => ({
    source: nodeMap[source],
    target: nodeMap[target]
  }));
  return {nodes, links};
});

export const getGraph = createSelector(getRawData, data => {
  const nodeMap = data.reduce((map, {source, target}) => {
    return [source, target].reduce(
      (m, id) =>
        m.hasOwnProperty(id)
          ? m
          : Object.assign(m, {[id]: {id, width: 20, height: 20}}),
      map
    );
  }, {});
  const nodes = nodeMap.values();
  const links = data.map(({source, target}) => ({
    id: source + '-' + target,
    sourceId: source,
    targetId: target
  }));
  return {nodes, links};
});

export const getMatrix = createSelector(getRawData, data => {
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

export const getMatrixPaddings = createSelector(rootSelector, state => [
  600,
  320
]);

export const getMatrixCellSize = createSelector(rootSelector, state => [
  20,
  20
]);

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
