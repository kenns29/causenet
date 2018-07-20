import numpy as np
import pickle
from pandas import read_csv, cut, qcut
from setup import data_dir


def load_raw_data():
    return read_csv(filepath_or_buffer=data_dir + '/eats_subset_without_near_real_time.csv')


def filter_data(data):
    keys = data.keys()[~data.keys().isin(['rush_job_uuid', 'rs_geohash_five',
                                          'order_job_uuid', 'rs_uuid', 'rs_geohash_six', 'workflow_uuid',
                                          '@derived:restaurant_longitude', '@derived:restaurant_latitude'])]
    filtered_data = data.filter(items=keys)
    numerical_keys = filtered_data.select_dtypes(exclude=['object']).keys()
    for key in numerical_keys:
        filtered_data = filtered_data[filtered_data[key] > 0]
    return filtered_data


def get_qcut_5_data(filtered_data):
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


def load_qcut_5_data():
    return get_qcut_5_data(filter_data(load_raw_data()))


def get_lookalike_raw_data():
    return read_csv(filepath_or_buffer='data/lookalike.csv',
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
    return read_csv(filepath_or_buffer='data/lookalike.csv',
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
        print('cut key={}'.format(key))
        bin_data[key] = cut(bin_data[key], 5)
    for key in ['lifetime_rating']:
        bin_data[key] = cut(bin_data[key], [-1, 0, 1, 2, 3, 4, 5])
    for key in categorical_keys:
        bin_data[key] = bin_data[key].astype('category')
    return bin_data


def load_lookalike_full_feature_cut_5_data():
    with open(data_dir + '/lookalike_full_feature_cut5.bin', mode='rb') as file:
        data = pickle.load(file)
        return data.filter(items=data.keys()[~data.keys().isin(['city_id'])])

def get_blip_value_converters(data):
    return [dict((value, index) for index, value in enumerate(data[col].cat.categories)) for col in data]


def get_blip_value_inverters(data):
    return [dict((index, value) for index, value in enumerate(data[col].cat.categories)) for col in data]


def get_col2index(data):
    return dict((value, index) for index, value in enumerate(data.keys()))


def get_index2col(data):
    return dict((index, value) for index, value in enumerate(data.keys()))


def to_blip_str(data, value_converters=None):
    val_converters = get_blip_value_converters(data) if not value_converters else value_converters
    header = ' '.join(data.keys())
    cards = ' '.join([str(data[col].cat.categories.size) for col in data])
    values = '\n'.join([' '.join([str(val_converters[index][value])
                                  for index, value in enumerate(row.get_values())]) for index, row in data.iterrows()])
    return '\n'.join([header, cards, values])


def to_blip_data(data, value_converters=None):
    value_converters = get_blip_value_converters(data) if not value_converters else value_converters
    new_data = data.copy()
    keys = new_data.keys()
    for index, key in enumerate(keys):
        new_data[key].cat.categories = [value_converters[index][value] for value in new_data[key].cat.categories]
    return new_data


def blip_data_to_blip_str(data):
    header = ' '.join(data.keys())
    cards = ' '.join([str(data[col].cat.categories.size) for col in data])
    values = '\n'.join([' '.join([str(value) for value in row.get_values()]) for index, row in data.iterrows()])
    return '\n'.join([header, cards, values])
