import os, pickle, json
from fastcluster import linkage
from pandas import read_csv, cut, DataFrame
from setup import data_dir, metadata_dir, model_dir, data_config_dir, config_dir, model_config_dir
from modules.service.data_utils import get_feature_pdist, get_base_avg_data, get_column_normalized_data
from modules.service.sqlite_utils.query import query_country_by_year_with_import_export_data_frame_by_item_group, \
    query_country_by_year_with_import_export_item_group_data_frame


data_config = {
    'test_0': {
        'raw_data_file': 'test_0_raw.bin',
        'normalized_raw_data_file': 'test_0_normalized_raw.bin',
        'data_file': 'test_0.bin',
        'base_avg_data_file': 'test_0_base_avg.bin',
        'pdist_file': 'test_0_pdist.bin',
        'clustering_file': 'test_0_clustering.bin',
    },
    'fao_fused_spatio_temporal_cut_10': {
        'raw_data_file': 'fao_fused_spatio_temporal_cut_10_raw.bin',
        'normalized_raw_data_file': 'fao_fused_spatio_temporal_cut_10_normalized_raw.bin',
        'data_file': 'fao_fused_spatio_temporal_cut_10.bin',
        'base_avg_data_file': 'fao_fused_spatio_temporal_cut_10_base_avg.bin',
        'pdist_file': 'fao_fused_spatio_temporal_cut_10_pdsit.bin',
        'clustering_file': 'fao_fused_spatio_temporal_cut_10_clustering.bin',
    },
    'fao_fused_bn_data_2013_cut_10': {
        'raw_data_file': 'fao_fused_bn_data_2013_cut_10_raw.bin',
        'normalized_raw_data_file': 'fao_fused_bn_data_2013_cut_10_normalized_raw.bin',
        'data_file': 'fao_fused_bn_data_2013_cut_10.bin',
        'base_avg_data_file': 'fao_fused_bn_data_2013_cut_10_base_avg.bin',
        'pdist_file': 'fao_fused_bn_data_2013_cut_10_pdsit.bin',
        'clustering_file': 'fao_fused_bn_data_2013_cut_10_clustering.bin',
    },
    'fao_country_by_year_with_import_export_by_item_group_1_cut_10': {
        'raw_data_file': 'fao_country_by_year_with_import_export_by_item_group_1_cut_10_raw.bin',
        'normalized_raw_data_file': 'fao_country_by_year_with_import_export_by_item_group_1_cut_10_normalized_raw.bin',
        'data_file': 'fao_country_by_year_with_import_export_by_item_group_1_cut_10.bin',
        'base_avg_data_file': 'fao_country_by_year_with_import_export_by_item_group_1_cut_10_base_avg.bin',
        'pdist_file': 'fao_country_by_year_with_import_export_by_item_group_1_cut_10_pdsit.bin',
        'clustering_file': 'fao_country_by_year_with_import_export_by_item_group_1_cut_10_clustering.bin',
    },
    'fao_country_by_year_with_import_export_item_group_cut_10': {
        'raw_data_file': 'fao_country_by_year_with_import_export_item_group_cut_10_raw.bin',
        'normalized_raw_data_file': 'fao_country_by_year_with_import_export_item_group_cut_10_normalized_raw.bin',
        'data_file': 'fao_country_by_year_with_import_export_item_group_cut_10.bin',
        'base_avg_data_file': 'fao_country_by_year_with_import_export_item_group_cut_10_base_avg.bin',
        'pdist_file': 'fao_country_by_year_with_import_export_item_group_cut_10_pdsit.bin',
        'clustering_file': 'fao_country_by_year_with_import_export_item_group_cut_10_clustering.bin',
    }
}


def load_test_0_data():
    raw_data = read_csv(os.path.join(metadata_dir, 'test.csv'))
    normalized_data = get_column_normalized_data(raw_data)
    data = normalized_data.copy()
    for key in data:
        data[key] = data[key].astype('str').astype('category')
    return raw_data, normalized_data, data


def load_fused_fao_spatio_temporal_cut_10_data():
    raw_data = read_csv(os.path.join(metadata_dir, 'fused_spatio_temporal_bn_data.csv'), index_col=0)
    normalized_data = get_column_normalized_data(raw_data)
    data = normalized_data.copy()
    for key in data:
        data[key] = cut(data[key], 10)
    return raw_data, normalized_data, data


def load_fused_fao_bn_2013_cut_10_data():
    raw_data = read_csv(os.path.join(metadata_dir, 'fused_bn_data_2013.csv'), index_col=0)
    normalized_data = get_column_normalized_data(raw_data)
    data = normalized_data.copy()
    for key in data:
        data[key] = cut(data[key], 10)
    return raw_data, normalized_data, data


def load_country_by_year_with_import_export_cut_10_data_frame():
    raw_data = query_country_by_year_with_import_export_data_frame_by_item_group(1)
    normalized_data = get_column_normalized_data(raw_data)
    data = normalized_data.copy()
    for key in data:
        data[key] = cut(data[key], 10)
    return raw_data, normalized_data, data


def load_country_by_year_with_import_export_item_group_cut_10_data():
    raw_data = query_country_by_year_with_import_export_item_group_data_frame()
    normalized_data = get_column_normalized_data(raw_data)
    data = DataFrame()
    for key in normalized_data:
        try:
            data[key] = cut(normalized_data[key], 10)
        except (KeyboardInterrupt, SystemExit):
            raise
        except:
            print('unexpected error during data frame cut')
    normalized_data = normalized_data.filter(data.keys())
    raw_data = raw_data.filter(data.keys())
    return raw_data, normalized_data, data


def init_data_dir():
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)


def save_binary_to_data_dir(data, name):
    with open(data_dir + '/' + name, mode='wb') as file:
        pickle.dump(data, file)
    return data


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
            json.dump(dict((key, {}) for key in data_config.keys), file, indent='\t')
    with open(model_config_dir, mode='r+') as file:
        config = json.load(file)
        for key in data_config.keys():
            config[key] = {} if key not in config else config[key]
        file.seek(0)
        json.dump(config, file, indent='\t')
        file.truncate()


def init_model_sub_dirs():
    for key in data_config.keys():
        if not os.path.exists(model_dir + '/' + key):
            os.makedirs(model_dir + '/' + key)


def make_data(config, load_data):
    raw_data, normalized_raw_data, data = load_data()
    save_binary_to_data_dir(raw_data, config['raw_data_file'])
    save_binary_to_data_dir(normalized_raw_data, config['normalized_raw_data_file'])
    save_binary_to_data_dir(data, config['data_file'])
    base_avg_data = get_base_avg_data(normalized_raw_data)
    save_binary_to_data_dir(base_avg_data, config['base_avg_data_file'])
    dist = get_feature_pdist(base_avg_data)
    save_binary_to_data_dir(dist, config['pdist_file'])
    clustering = linkage(dist, preserve_input=False)
    save_binary_to_data_dir(clustering, config['clustering_file'])


def make_datas():
    # # make test 0 data
    # make_data(data_config['test_0'], load_test_0_data)
    # # make fused spatio temporal data
    # make_data(data_config['fao_fused_spatio_temporal_cut_10'], load_fused_fao_spatio_temporal_cut_10_data)
    # # make fused fao 2013 data
    # make_data(data_config['fao_fused_bn_data_2013_cut_10'], load_fused_fao_bn_2013_cut_10_data)
    # # make country by year test data
    # make_data(data_config['fao_country_by_year_with_import_export_by_item_group_1_cut_10'],
    #           load_country_by_year_with_import_export_cut_10_data_frame)
    # make country by year with item group data
    make_data(data_config['fao_country_by_year_with_import_export_item_group_cut_10'],
              load_country_by_year_with_import_export_item_group_cut_10_data)


if __name__ == '__main__':
    init_config()
    init_data_dir()
    make_datas()
    save_data_config()
    init_model_dir()
    init_model_config()
    init_model_sub_dirs()
