import numpy as np


def tree2dict(node, index2col=None):
    """
    Convert the tree to a dictionary

    :param node: root of the tree -- ClusterNode
    :param index2col: (Optional) a mapping from id of the leaf node to its variable name
    :return: the dictionary
    """
    if not node:
        return None
    d = {
        'id': node.get_id(),
        'count': node.get_count(),
        'dist': node.dist,
        'left': tree2dict(node.get_left(), index2col),
        'right': tree2dict(node.get_right(), index2col)
    }
    if node.is_leaf() and index2col:
        node['name'] = index2col[node.get_id()]
    return d


def tree_to_non_binary_dict(node, index2col=None):
    """
    Convert the tree to non binary tree format dictionary, in which the children of each node is stored in the
    children list.

    :param node: root of the tree -- ClusterNode
    :param index2col: (Optional) a mapping from id of the leaf node to its variable name
    :return: the dictionary
    """
    if not node:
        return None
    children = []
    left = tree_to_non_binary_dict(node.get_left(), index2col)
    right = tree_to_non_binary_dict(node.get_right(), index2col)
    if left:
        children.append(left)
    if right:
        children.append(right)
    d = {
        'id': node.get_id(),
        'count': node.get_count(),
        'dist': node.dist,
        'children': children
    }
    if node.is_leaf() and index2col:
        d['name'] = index2col[node.get_id()]
    return d


def normalize_clustering_dist(clustering):
    max_dist = clustering[-1][2]
    return np.array([[n1, n2, n_dist / max_dist, num] for n1, n2, n_dist, num in clustering])


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
