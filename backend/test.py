from modules.service.edge_weights import get_edge_weights
from modules.service.model_utils import get_model, blip_learn_structure
from modules.service.data_utils import get_lookalike_full_feature_raw_data, \
    filter_lookalike_full_feature_data, get_lookalike_full_feature_cut_5_data, \
    load_lookalike_full_feature_cut_5_data, lookalike_bool_keys, to_blip_data, blip_data_to_blip_str, \
    get_blip_value_converters, get_blip_value_inverters, load_lookalike_cut_5_data, get_index2col, get_col2index
from setup import data_dir
from pandas import cut
import numpy as np
from scipy.spatial.distance import pdist
from scipy.cluster.vq import kmeans, kmeans2
from scipy.cluster.hierarchy import dendrogram, cut_tree, to_tree
import pickle
from sklearn.cluster import AgglomerativeClustering, DBSCAN
from fastcluster import linkage
from scipy.cluster import hierarchy
import matplotlib.pyplot as plt


def test_get_edge_weights():
    model = get_model('qcut5.bin')
    weighted_edges = get_edge_weights(model)
    print(weighted_edges)


def test_load_lookalike_full_feature_data():
    raw_data = get_lookalike_full_feature_raw_data()
    filtered_data = filter_lookalike_full_feature_data(raw_data)
    bin_data = get_lookalike_full_feature_cut_5_data(filtered_data)
    return bin_data


def check_cut(data):
    categorical_keys = data.select_dtypes(include=['object', 'bool']).keys().tolist()
    numerical_keys = data.keys()[~data.keys().isin(categorical_keys + ['lifetime_rating'])].tolist()
    bin_data = data.copy()
    for key in numerical_keys:
        try:
            bin_data[key] = cut(bin_data[key], 5)
        except Exception:
            print(key)


def save_lookalike_full_feature_data():
    bin_data = test_load_lookalike_full_feature_data()
    with open(data_dir + '/lookalike_full_feature_cut5.bin', mode='wb') as file:
        pickle.dump(bin_data, file)
    return bin_data


def save_lookalike_full_feature_pdist():
    bin_data = load_lookalike_full_feature_cut_5_data()
    value_converters = get_blip_value_converters(bin_data)
    blip_data = to_blip_data(bin_data, value_converters)
    matrix = blip_data.values.astype('double').transpose()
    dist = pdist(matrix, metric='jaccard')
    with open(data_dir + '/lookalike_full_feature_cut5_euclidean_pdist.bin', mode='wb') as file:
        pickle.dump(dist, file)
    return dist


def load_lookalike_full_feature_pdist():
    with open(data_dir + '/lookalike_full_feature_cut5_euclidean_pdist.bin', mode='rb') as file:
        return pickle.load(file)


def plot_dendrogram(clustering, index2col):
    N = len(index2col)
    plt.figure()
    dn = dendrogram(clustering)
    plt.show()


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
    nodes = cut_tree_by_dist(root, threshold)
    return [[leaf.get_id() for leaf in get_leaf_nodes(node)] for node in cut_tree_by_dist(root, threshold)]


def find_na(data):
    for key in data.keys():
        for index, value in enumerate(data[key]):
            if np.isnan(value):
                print(key, index, value)


data = load_lookalike_full_feature_cut_5_data()
index2col = get_index2col(data)
save_lookalike_full_feature_pdist()
dist = load_lookalike_full_feature_pdist()
clustering = linkage(dist)
normalized_clustering = normalize_clustering_dist(clustering)
tree = to_tree(normalized_clustering)
clusters = cut_tree_to_clustering_by_dist(tree, 0.02)
named_clusters = [[index2col[item] for item in cluster] for cluster in clusters]
plot_dendrogram(clustering, index2col)

