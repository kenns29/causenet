import os, json, pickle, re
from scipy.spatial.distance import pdist
from pandas import DataFrame
from setup import base_dir, data_dir, data_config_dir


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


def load_data():
    status = get_current_dataset_status()
    with open(os.path.join(data_dir, status['data_file']), mode='rb') as file:
        return pickle.load(file)


def load_pdist():
    status = get_current_dataset_status()
    with open(os.path.join(data_dir, status['pdist_file']), mode='rb') as file:
        return pickle.load(file)


def load_clustering():
    status = get_current_dataset_status()
    with open(os.path.join(data_dir, status['clustering_file']), mode='rb') as file:
        return pickle.load(file)


def get_times(data):
    time_set = set()
    for key in data.keys():
        finds = re.findall(r'.+~(\d{4})', key)
        if finds:
            time_set.add(int(finds[0]))
    return list(time_set)


def get_base_features(data):
    return list(set(re.sub(r'~\d{4}', '', key) for key in data.keys()))


def get_feature_pdist(data):
    """
    Compute the correlation distance [0, 2] between each features in the data.
    Converts the categorical data to numerical values before the computation

    :param data: input data -- DataFrame
    :return: the condensed SciPy distance matrix
    """
    value_converters = get_blip_value_converters(data)
    blip_data = to_blip_data(data, value_converters)
    matrix = blip_data.values.astype('double').transpose()
    return pdist(matrix, metric='correlation')


def get_base_feature_pdist(data):
    times = get_times(data)
    base_features = get_base_features(data)
    return None


def get_blip_value_converters(data):
    return [dict((value, index) for index, value in enumerate(data[col].cat.categories)) for col in data]


def get_blip_value_inverters(data):
    return [dict((index, value) for index, value in enumerate(data[col].cat.categories)) for col in data]


def get_col2index(data):
    return dict((value, index) for index, value in enumerate(data.keys()))


def get_index2col(data):
    return dict((index, value) for index, value in enumerate(data.keys()))


def to_blip_str(data, value_converters=None):
    """
    Convert the data frame to the string format that blip recognizes:
    * First line: list of variables names, separated by space;
    * Second line: list of variables cardinalities, separated by space;
    * Following lines: list of values taken by the variables in each datapoint, separated by space.

    :param data: input data -- DataFrame
    :param value_converters: (Optional) converts the categorical values in each feature to an integer
    representation -- list<dict>
    :return: the blip input string
    """
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
