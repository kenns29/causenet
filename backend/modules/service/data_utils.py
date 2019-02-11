import os, json, pickle, re, csv
import numpy as np
from scipy.spatial.distance import pdist
from pandas import DataFrame
from setup import base_dir, data_dir, data_config_dir, blip_data_dir


def get_current_dataset_name():
    with open(os.path.join(base_dir, 'config.json'), mode='r') as file:
        config = json.load(file)
        return config['current_dataset']


def update_current_dataset_name(name):
    with open(os.path.join(base_dir, 'config.json'), mode='r+') as file:
        config = json.load(file)
        config['current_dataset'] = name
        file.seek(0)
        json.dump(config, file, indent='\t')
        file.truncate()
        return config['current_dataset']


def get_dataset_config():
    with open(data_config_dir, mode='r') as file:
        return json.load(file)


def get_current_dataset_status():
    return get_dataset_config()[get_current_dataset_name()]


def load_data(data_type='data_file'):
    """
    load the data from the pickled binary file

    :param data_type:
        "raw_data_file" |
        "normalized_raw_data_file" |
        "data_file" |
        "base_avg_data_file" |
        "pdist_file" |
        "clustering_file"
    :return: the panda data frame
    """
    status = get_current_dataset_status()
    with open(os.path.join(data_dir, status[data_type]), mode='rb') as file:
        return pickle.load(file)


def load_pdist():
    status = get_current_dataset_status()
    with open(os.path.join(data_dir, status['pdist_file']), mode='rb') as file:
        return pickle.load(file)


def load_clustering():
    status = get_current_dataset_status()
    with open(os.path.join(data_dir, status['clustering_file']), mode='rb') as file:
        return pickle.load(file)


def get_times(data, base_feature=None):
    time_set = set()
    if any([not isinstance(key, str) for key in data.keys()]):
        return time_set
    for key in data.keys():
        finds = None
        if base_feature is None:
            finds = re.findall(r'.+~(\d{4})', key)
        elif re.match('\d{4}', key.replace(base_feature + '~', '')):
            finds = re.findall(r'(\d{4})', key.replace(base_feature + '~', ''))
        if finds:
            time_set.add(int(finds[0]))
    return list(time_set)


def is_temporal_data(data):
    return bool(get_times(data))


def is_temporal_feature(feature):
    return re.match(r'.+~\d{4}', feature)


def split_feature(feature):
    base, time, location = feature.split('~')
    return base, int(time), location


def get_base_features(data):
    return list(set(re.sub(r'~\d{4}', '', key) for key in data.keys()))


def get_base_avg_data(data):
    """
    Compute the base feature dataset aggregated using average

    :param data: the (un-binned) original data frame
    :return: the aggregated data
    """
    times = get_times(data)
    if not times:
        return data
    base_features = get_base_features(data)
    r_data = DataFrame(columns=base_features, index=data.index)
    for key in r_data.keys():
        times = get_times(data, key)
        r_data[key] = data.filter(['{}~{}'.format(key, time) for time in times]).mean(axis=1)
    return r_data


def get_column_mean_aggregated_data(data, aggregator):
    """
    aggregate the data

    :param data: The panda DataFrame
    :param aggregator: array form: [[feature, ...], ...] or dict form: {key: [feature, ...], ...}, when in array form
                       the index is used as key
    :return: the aggregated DataFrame
    """
    if aggregator is None:
        return data
    r_data = DataFrame(index=data.index)
    for key, g in enumerate(aggregator) if type(aggregator) is list else aggregator.items():
        if isinstance(g, list):
            r_data[key] = data.filter(g).mean(axis=1)
        elif type(aggregator) is list:
            r_data[g] = data[g]
        else:
            r_data[key] = data[g]
    return r_data


def get_raw_categorical_column_value_converter(data, key):
    index = 0
    r_dict = dict()
    for value in data[key]:
        if value not in r_dict:
            r_dict[value] = index
            index += 1
    return r_dict


def get_column_normalized_data(data, range=[0, 1]):
    r_data = data.copy()
    for key in data.keys():
        if not np.issubdtype(r_data[key].dtype, np.number):
            value_converter = get_raw_categorical_column_value_converter(r_data, key)
            r_data[key].replace(value_converter, inplace=True)
        min = r_data[key].min()
        max = r_data[key].max()
        if min < max:
            r_data[key] = range[0] + (r_data[key] - min) / (max - min) * (range[1] - range[0])
    return r_data


def get_feature_pdist(data, convert_categorical=False):
    """
    Compute the correlation distance [0, 2] between each features in the data.
    Converts the categorical data to numerical values before the computation

    :param data: input data -- DataFrame
    :param convert_categorical: specify if convert the categorical variables to numerical one
    :return: the condensed SciPy distance matrix
    """
    r_data = data.copy()
    if convert_categorical:
        for key in r_data.keys():
            if not np.issubdtype(r_data[key].dtype, np.number):
                value_converter = get_raw_categorical_column_value_converter(r_data, key)
                r_data[key].replace(value_converter, inplace=True)
    matrix = r_data.values.astype('double').transpose()
    return pdist(matrix, metric='correlation')


def get_blip_value_converters(data):
    return [dict((value, index) for index, value in enumerate(data[col].cat.categories)) for col in data]


def get_blip_value_inverters(data):
    return [dict((index, value) for index, value in enumerate(data[col].cat.categories)) for col in data]


def get_col2index(data):
    return dict((value, index) for index, value in enumerate(data.keys()))


def get_index2col(data):
    return dict((index, value) for index, value in enumerate(data.keys()))


def to_blip_array(data, value_converters=None):
    """
    Convert the data frame to the format that blip recognizes:
    * First line: list of variables names, separated by space;
    * Second line: list of variables cardinalities, separated by space;
    * Following lines: list of values taken by the variables in each datapoint, separated by space.

    :param data: input data -- DataFrame
    :param value_converters: (Optional) converts the categorical values in each feature to an integer
    representation -- list<dict>
    :return: the blip array
    """
    val_converters = get_blip_value_converters(data) if not value_converters else value_converters
    header = [index for index, key in enumerate(data.keys())]
    cards = [str(data[col].cat.categories.size) for col in data]
    values = [[str(val_converters[index][value]) for index, value in enumerate(data.loc[index].get_values())]
              for index in data.index]
    return [header, cards, *values]


def convert_data_values(data, value_converters=None):
    """
    Convert the values in the data frame to integers based on the value_converters

    :param data: input data -- DataFrame
    :param value_converters: (Optional) converts the categorical values in each feature to an integer
    representation -- list<dict>
    :return: the new data frame
    """
    value_converters = get_blip_value_converters(data) if not value_converters else value_converters
    new_data = data.copy()
    keys = new_data.keys()
    for index, key in enumerate(keys):
        new_data[key].cat.categories = [value_converters[index][value] for value in new_data[key].cat.categories]
    return new_data


def to_blip_data(data, value_converters=None, convert_keys=False):
    value_converters = get_blip_value_converters(data) if not value_converters else value_converters
    converted_data = convert_data_values(data, value_converters)
    keys = [index for index, key in enumerate(converted_data.keys())] if convert_keys else converted_data.keys()
    card_data = DataFrame([[converted_data[col].cat.categories.size for col in converted_data]],
                          index=['cards'], columns=keys, dtype='category')
    return DataFrame(np.concatenate((card_data.values, converted_data.values)),
                     index=['cards', *converted_data.index.tolist()], columns=keys)


def to_blip_csv(data, value_converters=None):
    blip_data = to_blip_data(data, value_converters, convert_keys=True)
    blip_data.to_csv(os.path.join(blip_data_dir, 'input.dat'),
                     sep=' ', quotechar='"', quoting=csv.QUOTE_MINIMAL, index=False)
