import os, pickle, json
import numpy as np
from fastcluster import linkage
from pandas import read_csv, cut, qcut
from setup import data_dir, metadata_dir, model_dir, data_config_dir, config_dir, model_config_dir
from modules.service.data_utils import get_feature_pdist


def init_data_dir():
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)


def get_filtered_eats_data():
    data = read_csv(filepath_or_buffer=metadata_dir + '/eats_subset_without_near_real_time.csv')
    keys = data.keys()[~data.keys().isin(['rush_job_uuid', 'rs_geohash_five',
                                          'order_job_uuid', 'rs_uuid', 'rs_geohash_six', 'workflow_uuid',
                                          '@derived:restaurant_longitude', '@derived:restaurant_latitude'])]
    filtered_data = data.filter(items=keys)
    numerical_keys = filtered_data.select_dtypes(exclude=['object']).keys()
    for key in numerical_keys:
        filtered_data = filtered_data[filtered_data[key] > 0]
    return filtered_data


def get_eats_qcut_5_data(filtered_data):
    numerical_keys = filtered_data.select_dtypes(exclude=['object']).keys()
    categorical_keys = filtered_data.select_dtypes(include=['object']).keys()
    bin_data = filtered_data.copy()
    for key in numerical_keys:
        if key in ['@derived:restaurant_default_prep_time', '@derived:stage__order_number_of_items']:
            bin_data[key] = cut(bin_data[key], 5)
        else:
            bin_data[key] = qcut(bin_data[key], 5)
    for key in categorical_keys:
        bin_data[key] = bin_data[key].astype('category')
    return bin_data


def load_eats_qcut_5_data():
    return get_eats_qcut_5_data(get_filtered_eats_data())


def get_lookalike_raw_data():
    return read_csv(filepath_or_buffer=metadata_dir + '/lookalike.csv',
                    na_values=['0'],
                    keep_default_na=False,
                    dtype={
                        'future_is_eats_driver': np.bool,
                        'future_is_high_eph_xd': np.bool,
                        'future_is_xd': np.bool,
                        'has_completed_trips_12weeks': np.bool,
                        'has_completed_trips_2weeks': np.bool,
                        'has_supply_hours_12weeks': np.bool,
                        'has_supply_hours_2weeks': np.bool,
                        'vehicle_has_minimum_score': np.bool,
                        'is_vehicle_solutions': np.bool,
                        'city_id': np.object,
                        'vehicle_year': np.object,
                        'vehicle_score': np.object
                    })


def filter_lookalike_data(data):
    # manually filter some features
    keys = data.keys()[~data.keys().isin([
        'Unnamed: 0',
        'datestr',
        'cohort',
        'driver_type',
        'driver_uuid',
        'earning_segment'
        ])]
    filtered_data = data.filter(items=keys)

    # filter columns that has too many missing values
    data_counts = data.count()
    n_rows, n_cols = data.shape
    keys = [key for key, count in data_counts.iteritems() if float(count) / n_rows >= 0.8]
    filtered_data = filtered_data.filter(items=keys)
    return filtered_data.dropna()


def get_lookalike_cut_5_data(data):
    categorical_keys = data.select_dtypes(include=['object', 'bool']).keys().tolist()
    numerical_keys = data.keys()[~data.keys().isin(categorical_keys + ['lifetime_rating'])].tolist()
    bin_data = data.copy()
    for key in numerical_keys:
        bin_data[key] = cut(bin_data[key], 5)
    for key in ['lifetime_rating']:
        bin_data[key] = cut(bin_data[key], [-1, 0, 1, 2, 3, 4, 5])
    for key in categorical_keys:
        bin_data[key] = bin_data[key].astype('category')
    return bin_data


def load_lookalike_cut_5_data():
    return get_lookalike_cut_5_data(filter_lookalike_data(get_lookalike_raw_data()))


def lookalike_bool_keys():
    return [
        'future_is_eats_driver',
        'future_is_high_eph_xd',
        'future_is_xd',
        'has_completed_trips_12weeks',
        'has_completed_trips_2weeks',
        'has_supply_hours_12weeks',
        'has_supply_hours_2weeks',
        'vehicle_has_minimum_score',
        'is_vehicle_solutions'
    ]


def get_lookalike_full_feature_raw_data():
    return read_csv(filepath_or_buffer=metadata_dir + '/lookalike.csv',
                    dtype={
                        'city_id': np.object,
                        'vehicle_year': np.object,
                        'vehicle_score': np.object
                    })


def filter_lookalike_full_feature_data(data):
    for key in lookalike_bool_keys():
        data[key] = data[key].dropna()
    # manually filter some features
    keys = data.keys()[~data.keys().isin([
        'Unnamed: 0',
        'city_id',
        'datestr',
        'cohort',
        'driver_type',
        'driver_uuid',
        'earning_segment',
        'eats_trip_ratio',
        'eats_trips',
        'taxi_trips_12weeks',
        'taxi_trips_2weeks',
        'taxi_trips_in_homecity_12weeks',
        'taxi_trips_in_homecity_2weeks',
        'taxi_trips_percentile_in_homecity_12weeks',
        'taxi_trips_percentile_in_homecity_2weeks',
        'taxi_trips_preference_in_homecity_12weeks',
        'taxi_trips_preference_in_homecity_2weeks',
        'taxi_trips_ratio_12weeks',
        'taxi_trips_ratio_2weeks'
        ])]
    filtered_data = data.filter(items=keys)
    return filtered_data


def get_lookalike_full_feature_cut_5_data(data):
    categorical_keys = data.select_dtypes(include=['object', 'bool']).keys().tolist()
    numerical_keys = data.keys()[~data.keys().isin(categorical_keys + ['lifetime_rating'])].tolist()
    bin_data = data.copy()
    for key in numerical_keys:
        bin_data[key] = cut(bin_data[key], 5)
    for key in ['lifetime_rating']:
        bin_data[key] = cut(bin_data[key], [-1, 0, 1, 2, 3, 4, 5])
    for key in categorical_keys:
        bin_data[key] = bin_data[key].astype('category')
    return bin_data


def load_lookalike_full_feature_cut_5_data():
    return get_lookalike_full_feature_cut_5_data(filter_lookalike_full_feature_data(get_lookalike_full_feature_raw_data()))


def save_binary_to_data_dir(data, name):
    with open(data_dir + '/' + name, mode='wb') as file:
        pickle.dump(data, file)
    return data


data_config = {
    'eats_qcut_5': {
        'data_file': 'eats_qcut_5.bin',
        'pdist_file': 'eats_qcut_5_pdist.bin',
        'clustering_file': 'eats_qcut_5_clustering.bin'
    },
    'lookalike_cut_5': {
        'data_file': 'lookalike_cut_5.bin',
        'pdist_file': 'lookalike_cut_5_pdist.bin',
        'clustering_file': 'lookalike_cut_5_clustering.bin'
    },
    'lookalike_full_feature_cut_5': {
        'data_file': 'lookalike_full_feature_cut_5.bin',
        'pdist_file': 'lookalike_full_feature_pdist.bin',
        'clustering_file': 'lookalike_full_feature_cut_5_clustering.bin'
    }
}


initial_model_config = {
    'eats_qcut_5': {},
    'lookalike_cut_5': {},
    'lookalike_full_feature_cut_5': {}
}


def save_data_config():
    with open(data_config_dir, mode='w') as file:
        json.dump(data_config, file, indent='\t')


def init_config():
    if not os.path.exists(config_dir):
        with open(config_dir, mode='w') as file:
            json.dump({
                'current_dataset': 'lookalike_full_feature_cut_5'
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
    # make eats qcut 5 data
    config = data_config['eats_qcut_5']
    data = load_eats_qcut_5_data()
    save_binary_to_data_dir(data, config['data_file'])
    dist = get_feature_pdist(data)
    save_binary_to_data_dir(dist, config['pdist_file'])
    clustering = linkage(dist, preserve_input=False)
    save_binary_to_data_dir(clustering, config['clustering_file'])

    # make lookalike cut 5 data
    config = data_config['lookalike_cut_5']
    data = load_lookalike_cut_5_data()
    save_binary_to_data_dir(data, config['data_file'])
    dist = get_feature_pdist(data)
    save_binary_to_data_dir(dist, config['pdist_file'])
    clustering = linkage(dist, preserve_input=False)
    save_binary_to_data_dir(clustering, config['clustering_file'])

    # make lookalike full feature cut 5 data
    config = data_config['lookalike_full_feature_cut_5']
    data = load_lookalike_full_feature_cut_5_data()
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
