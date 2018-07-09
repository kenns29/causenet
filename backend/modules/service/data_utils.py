from pandas import read_csv, cut, qcut


def load_raw_data():
    return read_csv(filepath_or_buffer='eats/eats_subset_without_near_real_time.csv')


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
    bin_data = filtered_data.copy()
    for key in numerical_keys:
        if key in ['@derived:restaurant_default_prep_time', '@derived:stage__order_number_of_items']:
            bin_data[key] = cut(bin_data[key], 5)
        else:
            bin_data[key] = qcut(bin_data[key], 5)
    return bin_data


def load_qcut_5_data():
    return get_qcut_5_data(filter_data(load_raw_data()))
