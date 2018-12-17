import {createSelector} from 'reselect';
import Matrix, {links2generator, flattener, sort2d} from 'sortable-matrix';
import {scaleDiverging} from 'd3-scale';
import {interpolateRdBu} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';
import {hierarchy as d3Hierarchy, cluster as d3Cluster} from 'd3-hierarchy';
import {
  getTreeLeaves,
  cutTreeByDist,
  cutTreeByDistToClustering,
  getCutTree,
  findMaxDistancePair
} from '../../utils';
import {rootSelector} from '../base';
import {
  getRawHierarchicalClusteringTree,
  getRawDistanceMap,
  getRawFeatureSelection,
  getHierarchicalClusteringCutThreshold
} from './raw.js';

const CLUSTERING_MATRIX_PADDINGS = [100, 100];
const CLUSTERING_MATRIX_CELL_SIZE = [10, 10];

/**
 * Obtain the list of all available features ordered acccording to the clustering
 * @param {Object} rawHierarchicalClusteringTree
 * @return {Array} -- this list of ordered features
 */
export const getFeatureList = createSelector(
  getRawHierarchicalClusteringTree,
  tree => getTreeLeaves(tree).map(d => d.name)
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

export const getHierarchicalClusteringCutClusters = createSelector(
  [getRawHierarchicalClusteringTree, getHierarchicalClusteringCutThreshold],
  cutTreeByDistToClustering
);

export const getHierachicalClusteringCutClusterNames = createSelector(
  getHierarchicalClusteringCutClusters,
  clusters => clusters.map(cluster => cluster.map(({name}) => name))
);

export const getHierachicalClusteringCut = createSelector(
  [getRawHierarchicalClusteringTree, getHierarchicalClusteringCutThreshold],
  cutTreeByDist
);

export const getHierarchicalClusteringCutClusterIdNamesMap = createSelector(
  getHierachicalClusteringCut,
  cut =>
    cut.reduce(
      (map, node) =>
        Object.assign(map, {
          [node.id]: getTreeLeaves(node).map(({name}) => name)
        }),
      {}
    )
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
      isCluster: cluster.length > 1,
      cluster
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
    const order = matrixOrder.map(({rep: {name}, isCluster, cluster}) => ({
      name,
      isCluster,
      cluster,
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
  state => CLUSTERING_MATRIX_PADDINGS
);

export const getClusteringMatrixCellSize = createSelector(
  rootSelector,
  state => CLUSTERING_MATRIX_CELL_SIZE
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
