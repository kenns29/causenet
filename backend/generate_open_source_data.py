import os, pickle, json
from fastcluster import linkage
from pandas import read_csv, cut, qcut
from setup import data_dir, metadata_dir, model_dir, data_config_dir, config_dir, model_config_dir
from modules.service.data_utils import get_feature_pdist


def load_test_0_data():
    data = read_csv(filepath_or_buffer=metadata_dir + '/test.csv')
    for key in data:
        data[key] = data[key].astype('str').astype('category')
    return data


def init_data_dir():
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)


def save_binary_to_data_dir(data, name):
    with open(data_dir + '/' + name, mode='wb') as file:
        pickle.dump(data, file)
    return data


data_config = {
    'test_0': {
        'data_file': 'test_0.bin',
        'pdist_file': 'test_0_pdist.bin',
        'clustering_file': 'test_0_clustering.bin'
    }
}


initial_model_config = {
    'test_0': {}
}


def save_data_config():
    with open(data_config_dir, mode='w') as file:
        json.dump(data_config, file, indent='\t')


def init_config():
    if not os.path.exists(config_dir):
        with open(config_dir, mode='w') as file:
            json.dump({
                'current_dataset': 'test_0'
            }, file, indent='\t')


def init_model_dir():
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)


def init_model_config():
    if not os.path.exists(model_config_dir):
        with open(model_config_dir, mode='w') as file:
            json.dump(initial_model_config, file, indent='\t')


def init_model_sub_dirs():
    for key, _ in initial_model_config.items():
        if not os.path.exists(model_dir + '/' + key):
            os.makedirs(model_dir + '/' + key)


def make_datas():
    # make test 0 data
    config = data_config['test_0']
    data = load_test_0_data()
    save_binary_to_data_dir(data, config['data_file'])
    dist = get_feature_pdist(data)
    save_binary_to_data_dir(dist, config['pdist_file'])
    clustering = linkage(dist, preserve_input=False)
    save_binary_to_data_dir(clustering, config['clustering_file'])


if __name__ == '__main__':
    init_config()
    init_data_dir()
    make_datas()
    save_data_config()
    init_model_dir()
    init_model_config()
    init_model_sub_dirs()
