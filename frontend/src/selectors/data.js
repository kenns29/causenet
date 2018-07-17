import {createSelector} from 'reselect';
import {rootSelector} from './base';
import dagre from 'dagre';
import {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential} from 'd3-scale';
import {interpolateGreys} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';

export const getModelList = createSelector(
  rootSelector,
  state => state.modelList
);

export const getSelectedModel = createSelector(
  rootSelector,
  state => state.selectedModel
);

export const getRawData = createSelector(rootSelector, state => state.data);

export const getNodeMap = createSelector(getRawData, data =>
  data.reduce((map, {source, target}) => {
    return [source, target].reduce(
      (m, label) =>
        m.hasOwnProperty(label) ? m : Object.assign(m, {[label]: {label}}),
      map
    );
  }, {})
);

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
  [getRawData, getNodeMap],
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

export const getNodeLinkViewOptions = createSelector(
  rootSelector,
  state => state.nodeLinkViewOptions
);
