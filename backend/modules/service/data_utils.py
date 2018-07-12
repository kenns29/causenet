import numpy as np
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
        bin_data[key] = cut(bin_data[key], [0, 1, 2, 3, 4, 5])
    for key in categorical_keys:
        bin_data[key] = bin_data[key].astype('category')
    return bin_data


def load_lookalike_cut_5_data():
    return get_lookalike_cut_5_data(filter_lookalike_data(get_lookalike_raw_data()))


def get_blip_value_converters(data):
    return [dict((value, index) for index, value in enumerate(values))
            for values in (data[col].unique().sort_values() for col in data)]


def get_blip_value_inverters(data):
    return [dict((index, value) for index, value in enumerate(values))
            for values in (data[col].unique().sort_values() for col in data)]


def get_col2index(data):
    return dict((value, index) for index, value in enumerate(data.keys()))


def get_index2col(data):
    return dict((index, value) for index, value in enumerate(data.keys()))


def to_blip_str(data):
    header = ' '.join(data.keys())
    cards = ' '.join([str(len(data[col].unique())) for col in data])
    val_converters = get_blip_value_converters(data)
    values = '\n'.join([' '.join([str(val_converters[index][value])
                                  for index, value in enumerate(row.get_values())]) for index, row in data.iterrows()])
    return '\n'.join([header, cards, values])



