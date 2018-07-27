export const getTreeLeaves = tree =>
  tree
    ? tree.children.length
      ? [].concat(...tree.children.map(getTreeLeaves))
      : [tree]
    : [];

export const cutTreeByDist = (tree, dist) =>
  tree
    ? tree.dist <= dist
      ? [tree]
      : [].concat(...tree.children.map(child => cutTreeByDist(child, dist)))
    : [];

export const cutTreeByDistToClustering = (tree, dist) =>
  cutTreeByDist(tree, dist).map(getTreeLeaves);

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
  return recurse(tree);
};
