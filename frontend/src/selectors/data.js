import {createSelector} from 'reselect';
import {rootSelector} from './base';
import dagre from 'dagre';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential, scaleDiverging} from 'd3-scale';
import {interpolateGreys, interpolateRdBu} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {getTreeLeaves} from '../utils';

export const getCurrentDatasetName = createSelector(
  rootSelector,
  state => state.currentDatasetName
);

export const getDatasetList = createSelector(
  rootSelector,
  state => state.datasetList
);

export const getModelList = createSelector(
  rootSelector,
  state => state.modelList
);

export const getSelectedModel = createSelector(
  rootSelector,
  state => state.selectedModel
);

export const getRawBayesianNetwork = createSelector(
  rootSelector,
  state => state.bayesianNetwork
);

export const getRawHierarchicalClusteringTree = createSelector(
  rootSelector,
  state => state.hierarchicalClusteringTree
);

export const getRawDistanceMap = createSelector(
  rootSelector,
  state => state.distanceMap
);

export const getNodeLinkViewOptions = createSelector(
  rootSelector,
  state => state.nodeLinkViewOptions
);

export const getNodeMap = createSelector(getRawBayesianNetwork, data =>
  data.reduce((map, {source, target}) => {
    return [source, target].reduce(
      (m, label) =>
        m.hasOwnProperty(label) ? m : Object.assign(m, {[label]: {label}}),
      map
    );
  }, {})
);

export const getMatrix = createSelector(getRawBayesianNetwork, data => {
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
  100,
  100
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

export const getDagLayout = createSelector(
  [getRawBayesianNetwork, getNodeMap],
  (links, nodeMap) => {
    const nodes = Object.values(nodeMap);
    const dag = new dagre.graphlib.Graph();
    dag.setGraph({});
    dag.setDefaultEdgeLabel(() => {});
    nodes.forEach(node => {
      dag.setNode(node.label, {...node, width: 20, height: 20});
    });
    links.forEach(({source, target}) => {
      dag.setEdge(source, target, {});
    });
    dagre.layout(dag);
    const layoutNodes = dag.nodes().map(v => dag.node(v));
    const layoutEdges = dag.edges().map(e => ({
      ...dag.edge(e),
      sourceId: e.v,
      targetId: e.w,
      source: dag.node(e.v),
      target: dag.node(e.w)
    }));
    return {nodes: layoutNodes, edges: layoutEdges};
  }
);

export const getId2DistanceFunction = createSelector(
  getRawDistanceMap,
  rawDistanceMap => (id1, id2) => {
    if (Number(id1) < Number(id2)) {
      return rawDistanceMap[id1 + '-' + id2];
    } else if (Number(id1) > Number(id2)) {
      return rawDistanceMap[id2 + '-' + id1];
    }
    return 0;
  }
);

export const getClusteringMatrixOrder = createSelector(
  getRawHierarchicalClusteringTree,
  tree => tree && getTreeLeaves(tree).map(({id, name}) => ({id, name}))
);

export const getClusteringMatrix = createSelector(
  [getClusteringMatrixOrder, getId2DistanceFunction],
  (matrixOrder, id2Distance) => {
    if (!matrixOrder) {
      return null;
    }
    const matrixData = matrixOrder.map(({id: rowId}) =>
      matrixOrder.map(({id: colId}) => id2Distance(rowId, colId))
    );
    const names = matrixOrder.map(({name}) => name);
    const {rows, cols, cells} = flattener().matrix(
      Matrix()
        .row_ids(names)
        .col_ids(names)
        .matrix_data(matrixData)
    );
    return {rows: rows(), cols: cols(), cells: cells()};
  }
);

export const getClusteringMatrixPaddings = createSelector(
  rootSelector,
  state => [100, 100]
);

export const getClusteringMatrixCellSize = createSelector(
  rootSelector,
  state => [20, 20]
);

export const getClusteringMatrixLayout = createSelector(
  [getClusteringMatrix, getClusteringMatrixCellSize],
  (matrix, [w, h]) => {
    if (!matrix) {
      return null;
    }
    const {rows, cols, cells} = matrix;
    const scale = scaleDiverging(interpolateRdBu).domain([1, 0.5, 0]);
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
