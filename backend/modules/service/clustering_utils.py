import numpy as np


# @param node (ClusterNode)
def tree2dict(node):
    return {
        'id': node.get_id(),
        'count': node.get_count(),
        'dist': node.dist,
        'left': tree2dict(node.get_left()),
        'right': tree2dict(node.get_right())
    } if node else None


def tree_to_non_binary_dict(node):
    if not node:
        return None
    children = []
    left = tree_to_non_binary_dict(node.get_left())
    right = tree_to_non_binary_dict(node.get_right())
    if left:
        children.append(left)
    if right:
        children.append(right)
    return {
        'id': node.get_id(),
        'count': node.get_count(),
        'dist': node.dist,
        'children': children
    }


# @param clustering (ndarray) -- the scipy hierarchy matrix
def normalize_clustering_dist(clustering):
    max_dist = clustering[-1][2]
    return np.array([[n1, n2, n_dist / max_dist, num] for n1, n2, n_dist, num in clustering])


# @param root (ClusterNode)
def cut_tree_by_dist(root, threshold):
    def recurse(node, nodes):
        if not node:
            return
        if node.dist <= threshold:
            nodes.append(node)
            return
        recurse(node.get_left(), nodes)
        recurse(node.get_right(), nodes)
    nodes = []
    recurse(root, nodes)
    return nodes


# @param root (ClusterNode)
def get_leaf_nodes(root):
    def recurse(node, nodes):
        if node.is_leaf():
            nodes.append(node)
            return
        recurse(node.get_left(), nodes)
        recurse(node.get_right(), nodes)
    nodes = []
    recurse(root, nodes)
    return nodes


def cut_tree_to_clustering_by_dist(root, threshold):
    return [[leaf.get_id() for leaf in get_leaf_nodes(node)] for node in cut_tree_by_dist(root, threshold)]
