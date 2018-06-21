import {createSelector} from 'reselect';
import {rootSelector} from './base';
import {links2generator, flattener} from 'sortable-matrix';

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
    .value(d => 1)
    .null(0);
  const matrix = generate();
  const {rows, cols, cells} = flattener().matrix(matrix);
  return {rows: rows(), cols: cols(), cells: cells()};
});

export const getMatrixPaddings = createSelector(rootSelector, state => [
  600,
  300
]);

export const getMatrixCellSize = createSelector(rootSelector, state => [
  20,
  20
]);

export const getMatrixLayout = createSelector(
  [getMatrix, getMatrixCellSize],
  ({rows, cols, cells}, [w, h]) => ({
    rows,
    cols,
    cells: cells.map(cell => ({
      ...cell,
      x: cell.col_index * w,
      y: cell.row_index * h,
      w,
      h
    }))
  })
);
