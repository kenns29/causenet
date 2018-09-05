import {createSelector} from 'reselect';
import {rootSelector} from './base';
import dagre from 'dagre';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleSequential, scaleDiverging} from 'd3-scale';
import {interpolateGreys, interpolateRdBu} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {hierarchy as d3Hierarchy, cluster as d3Cluster} from 'd3-hierarchy';
import {
  getTreeLeaves,
  cutTreeByDist,
  getCutTree,
  findMaxDistancePair,
  createNodeMap
} from '../utils';

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

export const getIsFetchingModifiedBayesianNetwork = createSelector(
  rootSelector,
  state => state.isFetchingModifiedBayesianNetwork
);

export const getRawBayesianNetwork = createSelector(
  rootSelector,
  state => state.bayesianNetwork
);

export const getRawModifiedBayesianNetwork = createSelector(
  rootSelector,
  state => state.modifiedBayesianNetwork
);

export const getRawBayesianModelFeatures = createSelector(
  rootSelector,
  state => state.bayesianModelFeatures
);

export const getRawBayesianModelFeatureValueSelectionMap = createSelector(
  rootSelector,
  state => state.bayesianModelFeatureValueSelectionMap
);

export const getHighlightedBayesianNetworkEdge = createSelector(
  rootSelector,
  state => state.highlightedBayesianNetworkEdge
);

export const getHighlightedBayesianModelFeature = createSelector(
  rootSelector,
  state => state.highlightedBayesianModelFeature
);

export const getHierarchicalClusteringOption = createSelector(
  rootSelector,
  state => state.hierarchicalClusteringOption
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

export const getRawFeatureSelection = createSelector(
  rootSelector,
  state => state.featureSelection
);

export const getRawFeatureValuesMap = createSelector(
  rootSelector,
  state => state.featureValuesMap
);

export const getNodeLinkViewOptions = createSelector(
  rootSelector,
  state => state.nodeLinkViewOptions
);

export const getIsTemporalBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  rawBayesianNetwork =>
    !rawBayesianNetwork.some(
      ({source, target}) => !source.includes('~') || !target.includes('~')
    )
);

export const getBayesianModelFeatures = createSelector(
  [getRawBayesianModelFeatures, getRawFeatureValuesMap],
  (features, featureValuesMap) =>
    features.map(feature => ({
      feature,
      values: featureValuesMap[feature]
    }))
);

/**
 * Obtain a map (label -> Node) in the Bayesian network
 * @param {Array} rawBayesianNetwork
 * @return {Object} the map
 */
export const getNodeMap = createSelector(getRawBayesianNetwork, createNodeMap);

/**
 * Obtain a map (label -> Node) in the modified Bayesian network
 * @param {Array} rawModifiedBayesianNetwork
 * @return {Object} the map
 */
export const getModifiedNodeMap = createSelector(
  getRawModifiedBayesianNetwork,
  createNodeMap
);

/**
 * Obtain a map ('sourceId-targetId' -> link) in the modified Bayesian network
 */
export const getModifiedLinkMap = createSelector(
  getRawModifiedBayesianNetwork,
  data =>
    data.reduce(
      (map, link) =>
        Object.assign(map, {[link.source + '-' + link.target]: link}),
      {}
    )
);

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

export const getMatrixPaddings = createSelector(rootSelector, state => [
  100,
  100
]);

export const getMatrixCellSize = createSelector(rootSelector, state => [
  20,
  20
]);

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

/**
 * Obtain the node-link data for the Bayesian Network
 */
export const getBayesianNetworkNodeLink = createSelector(
  [
    getRawBayesianNetwork,
    getModifiedLinkMap,
    getNodeMap,
    getModifiedNodeMap,
    getRawBayesianModelFeatureValueSelectionMap
  ],
  (
    rawLinks,
    modifiedLinkMap,
    nodeMap,
    modifiedNodeMap,
    featureValueSelectionMap
  ) => {
    const newNodeMap = Object.entries(nodeMap).reduce(
      (map, [key, node]) =>
        Object.assign(map, {
          [key]: {
            ...node,
            isModified: featureValueSelectionMap.hasOwnProperty(node.label),
            isRemoved: !modifiedNodeMap.hasOwnProperty(node.label)
          }
        }),
      {}
    );
    const nodes = Object.values(newNodeMap);
    const links = rawLinks.map(({source, target, weight}) => ({
      source: newNodeMap[source],
      target: newNodeMap[target],
      weight,
      isRemoved: !modifiedLinkMap.hasOwnProperty(source + '-' + target)
    }));
    return {nodes, links};
  }
);

/**
 * Obtain the Bayesian Network in a direct acyclic graph (DAG) layout using
 * the Dagre JavaScript library <https://github.com/dagrejs/dagre>
 */
export const getDagLayout = createSelector(
  getBayesianNetworkNodeLink,
  ({nodes, links}) => {
    const dag = new dagre.graphlib.Graph();
    dag.setGraph({rankdir: 'LR', ranker: 'tight-tree'});
    dag.setDefaultEdgeLabel(() => {});
    nodes.forEach(node => {
      dag.setNode(node.label, {...node, width: 30, height: 30});
    });
    links.forEach(({source, target, weight, isRemoved}) => {
      dag.setEdge(source.label, target.label, {weight, isRemoved});
    });
    dagre.layout(dag);
    const layoutNodes = dag
      .nodes()
      .map(v => Object.assign(dag.node(v), {width: 20, height: 20}));
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

export const getTemporalDagLayout = createSelector(
  getBayesianNetworkNodeLink,
  ({nodes, links}) => {}
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

export const getFeatureList = createSelector(
  getRawHierarchicalClusteringTree,
  tree => getTreeLeaves(tree).map(d => d.name)
);

export const getHierachicalClusteringCut = createSelector(
  [getRawHierarchicalClusteringTree, getHierarchicalClusteringCutThreshold],
  (tree, threshold) => {
    return cutTreeByDist(tree, threshold);
  }
);

export const getHierachicalClusteringCutTree = createSelector(
  [getRawHierarchicalClusteringTree, getHierachicalClusteringCut],
  getCutTree
);

/**
 * Obtain the cut clustering, each cluster is assigned a representative (rep)
 * node based on the maximum distance pair between this cluster and its sibline
 * cluster.
 */
export const getHierarchicalClusteringCutClustering = createSelector(
  [getHierachicalClusteringCutTree, getId2DistanceFunction],
  (tree, id2distance) => {
    const leaves = getTreeLeaves(tree);
    const clusterPairs = [
      ...new Set(leaves.filter(node => node.parent).map(node => node.parent))
    ].map(({children}) =>
      children.map(
        child =>
          child.cluster
            ? {id: child.id, cluster: child.cluster}
            : {id: child.id, cluster: getTreeLeaves(child)}
      )
    );
    const id2rep = clusterPairs.reduce(
      (map, [{id: id1, cluster: cluster1}, {id: id2, cluster: cluster2}]) => {
        const [maxNode1, maxNode2] = findMaxDistancePair(
          cluster1,
          cluster2,
          id2distance
        );
        return Object.assign(map, {[id1]: maxNode1, [id2]: maxNode2});
      },
      {}
    );
    return leaves.map(leave => ({...leave, rep: id2rep[leave.id] || leave}));
  }
);

/**
 * Obtain the row and column order for the hierarchical clustering matrix,
 * row and column should have identical orders
 */
export const getClusteringMatrixOrder = createSelector(
  getHierarchicalClusteringCutClustering,
  clustering =>
    clustering.map(({id, name, rep, cluster}) => ({
      id,
      name,
      rep,
      isCluster: cluster.length > 1
    }))
);

/**
 * Obtain the flattened hierarchical clustering matrix
 */
export const getClusteringMatrix = createSelector(
  [getClusteringMatrixOrder, getId2DistanceFunction, getRawFeatureSelection],
  (matrixOrder, id2Distance, featureSelection) => {
    const matrixData = matrixOrder.map(({rep: {id: rowId}}) =>
      matrixOrder.map(({rep: {id: colId}}) => id2Distance(rowId, colId))
    );

    const names = matrixOrder.map(({rep: {name: repName}}) => repName);
    const {cells} = flattener().matrix(
      Matrix()
        .row_ids(names)
        .col_ids(names)
        .matrix_data(matrixData)
    );

    const featureSelectionSet = new Set(featureSelection);
    const order = matrixOrder.map(({rep: {name}, isCluster}) => ({
      name,
      isCluster,
      isSelection: featureSelectionSet.has(name)
    }));
    return {
      rows: order,
      cols: order,
      cells: cells()
    };
  }
);

export const getClusteringMatrixPaddings = createSelector(
  rootSelector,
  state => [100, 100]
);

export const getClusteringMatrixCellSize = createSelector(
  rootSelector,
  state => [10, 10]
);

/**
 * Obtain the hierarchical clustering matrix layout
 */
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
  () => 100
);

/**
 * Obtain the d3 hierarchy object from the hierarchical clustering cut tree.
 * refer to d3-hierarchy<https://github.com/d3/d3-hierarchy> for more detail
 * This will be used for the dendogram layout generation
 */
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

/**
 * Generate a dendogram layout for the hierarchical matrix columns
 * @return {Object} -- the layout
 * nodes -- the internal nodes of the dendogram
 * links -- the paths connecting the nodes
 */
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

/**
 * Generate a dendogram layout for the hierarchical matrix rows
 * @return {Object} -- the layout
 * nodes -- the internal nodes of the dendogram
 * links -- the paths connecting the nodes
 */
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
