from modules.service.edge_weights import get_edge_weights
from modules.service.model_utils import get_model, blip_learn_structure
from modules.service.data_utils import get_lookalike_full_feature_raw_data, \
    filter_lookalike_full_feature_data, get_lookalike_full_feature_cut_5_data, \
    load_lookalike_full_feature_cut_5_data, lookalike_bool_keys, to_blip_data, blip_data_to_blip_str, \
    get_blip_value_converters, get_blip_value_inverters
from setup import data_dir
from pandas import cut
import pickle
from sklearn.cluster import AgglomerativeClustering

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


def test_load_lookalike_full_feature_cut_5_data():
    return load_lookalike_full_feature_cut_5_data()


data = test_load_lookalike_full_feature_cut_5_data()
value_converters = get_blip_value_converters(data)
value_inverters = get_blip_value_inverters(data)

blip_data = to_blip_data(data, value_converters)

print(blip_data)
# def affinity(a, b):
#     print(a)
#     print(b)
#     return 1
#
#
# clusterer = AgglomerativeClustering(linkage='complete', affinity=affinity)
#
# clustering = clusterer.fit_predict(matrix)

# print(clustering)
