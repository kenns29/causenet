import numpy as np


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
