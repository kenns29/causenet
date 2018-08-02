import os, pickle, subprocess, re, json
from pgmpy.models import BayesianModel
from pgmpy.estimators import BayesianEstimator
from modules.service.data_utils import get_current_dataset_name, to_blip_str, get_index2col
from setup import blip_data_dir, blip_dir, model_dir, model_config_dir


def get_model_config():
    with open(model_config_dir, mode='r') as file:
        return json.load(file)


def get_current_dataset_model_status():
    config = get_model_config()
    return config[get_current_dataset_name()]


def get_current_dataset_model_dir():
    return model_dir + '/' + get_current_dataset_name()


def get_model(name):
    with open(get_current_dataset_model_dir() + '/' + name, mode='rb') as file:
        return pickle.load(file)


def write_model(model, name):
    current_dataset_name = get_current_dataset_name()
    with open(get_current_dataset_model_dir() + '/' + name, mode='wb') as file:
        pickle.dump(model, file)
    with open(model_config_dir, mode='r+', encoding='utf-8') as file:
        config = json.load(file)
        status = config[current_dataset_name]
        if 'models' not in status:
            status['models'] = {}
        models = status['models']
        if name not in models:
            models[name] = {
                'model_file': name
            }
            file.seek(0)
            json.dump(config, file, indent='\t')
            file.truncate()
    return model


def delete_model(name):
    current_dataset_name = get_current_dataset_name()
    current_dataset_model_dir = get_current_dataset_model_dir()
    with open(model_config_dir, mode='r+', encoding='utf-8') as file:
        config = json.load(file)
        status = config[current_dataset_name]
        if 'models' not in status:
            return {}
        models = status['models']
        model_stat = models.pop(name, None)
        if model_stat is not None:
            file.seek(0)
            json.dump(config, file, indent='\t')
            file.truncate()
        if os.path.exists(current_dataset_model_dir + '/' + name):
            os.remove(current_dataset_model_dir + '/' + name)
        if os.path.exists(current_dataset_model_dir + '/weight.' + name):
            os.remove(current_dataset_model_dir + '/weight.' + name)
        return model_stat


def get_weighted_edges(name):
    current_dataset_model_dir = get_current_dataset_model_dir()
    if not os.path.exists(current_dataset_model_dir + '/weight.' + name):
        return None
    with open(current_dataset_model_dir + '/weight.' + name, mode='rb') as file:
        return pickle.load(file)


def write_weighted_edges(edges, name):
    current_dataset_name = get_current_dataset_name()
    current_dataset_model_dir = get_current_dataset_model_dir()
    with open(current_dataset_model_dir + '/weight.' + name, mode='wb') as file:
        pickle.dump(edges, file)
    with open(model_config_dir, mode='r+', encoding='utf-8') as file:
        config = json.load(file)
        status = config[current_dataset_name]
        models = status['models']
        models[name]['edge_weights_file'] = 'weight.' + name
        file.seek(0)
        json.dump(config, file, indent='\t')
        file.truncate()
    return edges


def blip_learn_structure(data):
    """
    Learn the Bayesian Network Structure using the blip java library:
    <https://github.com/mauro-idsia/blip>
    Using python subprocess to invoke the library executable, which is stored in backend/jars/

    :param data: Pandas DataFrame
    :return: edges in list of tuples
    """
    blip_data = to_blip_str(data)
    index2col = get_index2col(data)
    with open(blip_data_dir + '/input.dat', mode='w+', encoding='utf-8') as score_file:
        score_file.write(blip_data)
    subprocess.check_call([
        'java -jar ' + blip_dir + ' scorer.sq -c bdeu -d '
        + blip_data_dir + '/input.dat -j ' + blip_data_dir + '/score.jkl -n 3 -t 10' + ';'
        'java -jar ' + blip_dir + ' solver.kg.adv -smp ent -d ' + blip_data_dir + '/input.dat -j '
        + blip_data_dir + '/score.jkl -r ' + blip_data_dir + '/structure.res -t 10 -w 4 -v 1'
    ], shell=True)

    with open(blip_data_dir + '/structure.res', mode='r', encoding='utf-8') as structure_file:
        structure = structure_file.read()
        # Parse the result from the blip library
        m = re.findall(r'(?:\b(\d+):\s+(?:-?\d+(?:\.\d+)?)\s+(?:\((\d+)(?:,(\d+))*\)))', structure)
        edges = []
        for t in m:
            parent = index2col[int(t[0])]
            for child in [index2col[int(value)] for index, value in enumerate(t[1:]) if value]:
                edges.append((parent, child))
        return edges


def train_model(data, name):
    feature_selection = get_feature_selection()
    filtered_data = data.filter(feature_selection) if feature_selection else data
    edges = blip_learn_structure(filtered_data)
    model = BayesianModel(edges)
    model.fit(filtered_data, estimator=BayesianEstimator, prior_type='BDeu')
    write_model(model, name)
    return model


def get_model_list():
    status = get_current_dataset_model_status()
    if 'models' not in status:
        return []
    models = status['models']
    return [{'name': name, **value} for name, value in models.items()]


def update_feature_selection(features):
    if features is not None and not isinstance(features, list):
        raise TypeError('Unexpected Parameter: expecting a None or list')
    with open(model_config_dir, mode='r+') as file:
        config = json.load(file)
        status = config[get_current_dataset_name()]
        if features is None:
            status.pop('feature_selection', None)
        else:
            status['feature_selection'] = features
        file.seek(0)
        json.dump(config, file, indent='\t')
        file.truncate()
        return features


def get_feature_selection():
    """
    Obtain the feature selection

    :return: A list of selected features or None if no feature is selected (which means selecting all features)
    """
    with open(model_config_dir, mode='r') as file:
        config = json.load(file)
        status = config[get_current_dataset_name()]
        return status['feature_selection'] if 'feature_selection' in status else None
