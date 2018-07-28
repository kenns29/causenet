import {createSelector} from 'reselect';
import {rootSelector} from './base';
import dagre from 'dagre';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential, scaleDiverging} from 'd3-scale';
import {interpolateGreys, interpolateRdBu} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {hierarchy as d3Hierarchy, cluster as d3Cluster} from 'd3-hierarchy';
import {getTreeLeaves, cutTreeByDist, getCutTree} from '../utils';

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

export const getHierarchicalClusteringCutThreshold = createSelector(
  rootSelector,
  state => state.hierarchicalClusteringCutThreshold
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

export const getHierachicalClusteringCut = createSelector(
  [getRawHierarchicalClusteringTree, getHierarchicalClusteringCutThreshold],
  (tree, threshold) => {
    return cutTreeByDist(tree, threshold);
  }
);

export const getHierachicalClusteringCutClustering = createSelector(
  getHierachicalClusteringCut,
  cut =>
    cut.map(tree => {
      const cluster = getTreeLeaves(tree).map(({id, name}) => ({id, name}));
      return {
        rep: cluster[0],
        dist: tree.dist,
        cluster
      };
    })
);

export const getHierachicalClusteringCutTree = createSelector(
  [getRawHierarchicalClusteringTree, getHierachicalClusteringCut],
  getCutTree
);

export const getClusteringMatrixOrder = createSelector(
  getHierachicalClusteringCutTree,
  tree =>
    getTreeLeaves(tree).map(({id, name, cluster}) => ({
      id,
      name,
      rep: cluster && cluster[0]
    }))
);

export const getClusteringMatrix = createSelector(
  [getClusteringMatrixOrder, getId2DistanceFunction],
  (matrixOrder, id2Distance) => {
    if (!matrixOrder) {
      return null;
    }
    const matrixData = matrixOrder.map(({id: rowId, rep: rowRep}) => {
      const rId = rowRep ? rowRep.id : rowId;
      return matrixOrder.map(({id: colId, rep: colRep}) => {
        const cId = colRep ? colRep.id : colId;
        return id2Distance(rId, cId);
      });
    });
    const names = matrixOrder.map(
      ({id, name}) => name || Number(id).toString()
    );
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
    const scale = scaleDiverging(interpolateRdBu).domain([2, 1, 0]);
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
export const getHierachicalClusteringLayoutHeight = createSelector(
  rootSelector,
  () => 300
);
export const getHierachicalClusteringLayoutHierarchy = createSelector(
  [
    getHierachicalClusteringCutTree,
    getClusteringMatrixCellSize,
    getClusteringMatrixOrder,
    getHierachicalClusteringLayoutHeight
  ],
  (tree, [w, h], order, height) => {
    if (!tree) {
      return null;
    }
    const hierarchy = d3Hierarchy(tree);
    const clusterer = d3Cluster()
      .size([w * order.length, height])
      .separation(() => 1);
    return clusterer(hierarchy);
  }
);

export const getHierarchicalClusteringVerticalTreeLayout = createSelector(
  [
    getHierachicalClusteringLayoutHierarchy,
    getHierachicalClusteringLayoutHeight
  ],
  (hierarchy, height) => {
    if (!hierarchy) {
      return null;
    }
    const [nodes, links] = [[], []];

    hierarchy.each(n => {
      if (n.children && n.children.length) {
        const node = {...n, x: n.x, y: n.y - height};
        nodes.push(node);
        const [left, right] = node.children.map(d => ({
          ...d,
          x: d.x,
          y: d.y - height
        }));
        const mid = (node.y + Math.min(left.y, right.y)) / 2;
        [
          {
            sourcePosition: [node.x, node.y],
            targetPosition: [node.x, mid],
            nodes: [node, left, right]
          },
          {
            sourcePosition: [node.x, mid],
            targetPosition: [left.x, mid],
            nodes: [node, left]
          },
          {
            sourcePosition: [left.x, mid],
            targetPosition: [left.x, left.y],
            nodes: [node, left]
          },
          {
            sourcePosition: [node.x, mid],
            targetPosition: [right.x, mid],
            nodes: [node, right]
          },
          {
            sourcePosition: [right.x, mid],
            targetPosition: [right.x, right.y],
            nodes: [node, right]
          }
        ].forEach(link => links.push(link));
      }
    });
    return {nodes, links};
  }
);

export const getHierarchicalClusteringHorizontalTreeLayout = createSelector(
  getHierarchicalClusteringVerticalTreeLayout,
  layout => {
    if (!layout) {
      return null;
    }
    const {nodes, links} = layout;
    const nodeMap = nodes.reduce(
      (map, node) => ({
        ...map,
        [node.data.id]: {...node, x: node.y, y: node.x}
      }),
      {}
    );
    const hLinks = links.map(
      ({sourcePosition, targetPosition, nodes: vNodes}) => ({
        sourcePosition: sourcePosition.slice(0).reverse(),
        targetPosition: targetPosition.slice(0).reverse(),
        nodes: nodes.map(({data: {id}}) => nodeMap[id])
      })
    );
    return {nodes: Object.values(nodeMap), links: hLinks};
  }
);
