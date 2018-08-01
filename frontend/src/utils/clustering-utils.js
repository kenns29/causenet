export const getTreeLeaves = tree =>
  tree
    ? tree.children.length
      ? [].concat(...tree.children.map(getTreeLeaves))
      : [tree]
    : [];

/**
 * Assign a parent node for each node in the tree in place
 */
export const assignParentsToTree = (tree, parent = null) => {
  if (!tree) {
    return tree;
  }
  tree.parent = parent;
  tree.children.forEach(child => assignParentsToTree(child, tree));
  return tree;
};

/**
 * Cut the hierarchical clustering tree (dendogram) with a distance threshold
 * @param {Object} tree -- the dendogram
 * @param {Number} dist -- the distance threshold
 * @return {Array} An array of the cutted sub trees
 */
export const cutTreeByDist = (tree, dist) =>
  tree
    ? tree.dist <= dist
      ? [tree]
      : [].concat(...tree.children.map(child => cutTreeByDist(child, dist)))
    : [];

export const cutTreeByDistToClustering = (tree, dist) =>
  cutTreeByDist(tree, dist).map(getTreeLeaves);

/**
 * Obtain the cut tree. A cut tree is a tree whose leaf nodes are the cutted
 * subtrees. Each node is also assigned parent in the resulting tree.
 * @param {Object} tree -- the dendogram
 * @param {Array} cut -- the cutted sub trees
 * @return {Object} The cut tree
 */
export const getCutTree = (tree, cut) => {
  if (!tree) {
    return tree;
  }
  const cutMap = cut.reduce(
    (map, node) => Object.assign(map, {[node.id]: node}),
    {}
  );
  const recurse = node => ({
    ...node,
    children: cutMap.hasOwnProperty(node.id) ? [] : node.children.map(recurse),
    cluster: cutMap.hasOwnProperty(node.id)
      ? getTreeLeaves(cutMap[node.id]).map(d => ({...d}))
      : null
  });
  return assignParentsToTree(recurse(tree));
};

/**
 * Obtain a pair of nodes from the two clusters with the maximum distance. This
 * is to be used for finding a representative node for each cutted cluster.
 * (TODO: this part can be done with better efficiency if we can obtain the
 * distances between all internal nodes)
 * @param {Array} cluster1 -- A cluster of nodes
 * @param {Array} cluster2 -- Another cluster of nodes
 * @param {Function} pair2distance -- (Node1, Node2) => distance
 * @return {Array} the pair of nodes -- [Node1, Node2]
 */
export const findMaxDistancePair = (
  cluster1,
  cluster2,
  pair2distance,
  idAccessor = ({id}) => id
) => {
  if (cluster1.length === 0 || cluster2.length === 0) {
    throw new Error('clusters should be non-empty');
  }
  let maxDistance = -Infinity;
  let [n1, n2] = [cluster1[0], cluster2[0]];
  cluster1.forEach(node1 => {
    const id1 = idAccessor(node1);
    cluster2.forEach(node2 => {
      const id2 = idAccessor(node2);
      const distance = pair2distance(id1, id2);
      if (distance > maxDistance) {
        [n1, n2] = [node1, node2];
        maxDistance = distance;
      }
    });
  });
  return [n1, n2];
};
