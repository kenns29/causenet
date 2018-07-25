export const getTreeLeaves = tree =>
  tree && tree.children.length
    ? [].concat(...tree.children.map(getTreeLeaves))
    : tree;
