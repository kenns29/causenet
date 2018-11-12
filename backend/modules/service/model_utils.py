import os, pickle, subprocess, re, json, csv
from pgmpy.models import BayesianModel
from pgmpy.estimators import BayesianEstimator
from modules.service.data_utils import get_current_dataset_name, to_blip_str, get_index2col, \
    get_col2index, get_blip_value_converters, load_data, is_temporal_data, is_temporal_feature, get_times, to_blip_data, blip_data_to_blip_str, to_blip_array
from modules.service.utils import edges_to_child_adjacency_dict
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
    if not os.path.exists(os.path.join(current_dataset_model_dir, 'weight.' + name)):
        return None
    with open(os.path.join(current_dataset_model_dir, 'weight.' + name), mode='rb') as file:
        return pickle.load(file)


def write_weighted_edges(edges, name):
    current_dataset_name = get_current_dataset_name()
    current_dataset_model_dir = get_current_dataset_model_dir()
    with open(os.path.join(current_dataset_model_dir, 'weight.' + name), mode='wb') as file:
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
    print('generating inputs ...')
    blip_data = to_blip_array(data)
    index2col = get_index2col(data)
    with open(os.path.join(blip_data_dir, 'input.dat'), mode='w+', encoding='utf-8') as score_file:
        writer = csv.writer(score_file, delimiter=' ', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        writer.writerows(blip_data)
    subprocess.check_call(
        'java -jar ' + blip_dir + ' scorer.sq -c bdeu -d '
        + os.path.join(blip_data_dir, 'input.dat') + ' -j '
        + os.path.join(blip_data_dir, 'score.jkl') + ' -n 3 -t 10', shell=True)
    subprocess.check_call(
        'java -jar ' + blip_dir + ' solver.kg.adv -smp ent -d ' + os.path.join(blip_data_dir, 'input.dat') + ' -j '
        + os.path.join(blip_data_dir, 'score.jkl') + ' -r '
        + os.path.join(blip_data_dir, 'structure.res') + ' -t 10 -w 4 -v 1', shell=True)

    with open(os.path.join(blip_data_dir, 'structure.res'), mode='r', encoding='utf-8') as structure_file:
        structure = structure_file.read()
        # Parse the result from the blip library
        m = re.findall(r'(?:\b(\d+):\s+(?:-?\d+(?:\.\d+)?)\s+(?:\((\d+)(?:,(\d+))*\)))', structure)
        edges = []
        for t in m:
            child = index2col[int(t[0])]
            for parent in [index2col[int(value)] for index, value in enumerate(t[1:]) if value]:
                edges.append((parent, child))
        return edges


def parse_blip_parameters_uai(index2name=None):
    with open(os.path.join(blip_data_dir, 'parameters.uai'), mode='r') as parameters_file:
        cards = []
        cpds = []
        is_reading_cpds = False
        is_reading_cpd_table = False
        cpd_index = 0

        for line_number, line in enumerate(parameters_file):
            if line_number == 2:
                cards = [int(v) for v in line.split(' ')]
            if line_number < 4:
                continue
            if not is_reading_cpds:
                if not line.strip():
                    is_reading_cpds = True
                    continue
                variables = [int(v) for v in line.split('\t')]
                variable = variables[-1]
                evidence = [int(v) for i, v in enumerate(variables) if 0 < i < len(variables) - 1]
                cpds.append({'variable': variable,
                             'variable_card': cards[variable],
                             'evidence': evidence,
                             'evidence_card': [cards[e] for e in evidence]})
            if is_reading_cpds:
                if not is_reading_cpd_table:
                    is_reading_cpd_table = True
                    continue
                if is_reading_cpd_table:
                    if not line.strip():
                        is_reading_cpd_table = False
                        cpd_index += 1
                        continue
                    if 'values' not in cpds[cpd_index]:
                        cpds[cpd_index]['values'] = []
                    cpds[cpd_index]['values'].append([float(v) for v in line.strip().split(' ')])
        if index2name is not None:
            for cpd in cpds:
                cpd['variable'] = index2name[cpd['variable']]
                cpd['evidence'] = [index2name[e] for e in cpd['evidence']]
        return cpds


def blip_learn_parameters(index2col=None, data=None, edges=None):
    if data is not None:
        blip_data = to_blip_array(data)
        with open(os.path.join(blip_data_dir, 'input.dat'), mode='w+') as score_file:
            writer = csv.writer(score_file, delimiter=' ', quotechar='"', quoting=csv.QUOTE_MINIMAL)
            writer.writerows(blip_data)
    if edges is not None:
        if data is None:
            raise ValueError('data must be not None when edges are specified in the arguments.')
        col2index = get_col2index(data)
        child_adjacency_dict = edges_to_child_adjacency_dict(edges)
        with open(os.path.jsoin(blip_data_dir, 'structures.res'), mode='w+') as structure_file:
            for child, parent_set in child_adjacency_dict.items():
                structure_file.write(str(col2index[child]) + ': -200 ('
                                     + ','.join(str(col2index[p]) for p in parent_set))

    subprocess.check_call('java -jar ' + blip_dir + ' parle -d '
                          + os.path.join(blip_data_dir, 'input.dat') + ' -r '
                          + os.path.join(blip_data_dir, 'structure.res') + ' -n '
                          + os.path.join(blip_data_dir, 'parameters.uai'), shell=True)

    return parse_blip_parameters_uai(index2col)


def train_model(data, name):
    feature_selection = get_feature_selection()
    if is_temporal_data(data):
        feature_selection = [feature + '~' + str(time)
                             for feature in feature_selection for time in get_times(data, feature)] \
            if feature_selection is not None else None
    filtered_data = data.filter(feature_selection) if feature_selection is not None else data
    edges = blip_learn_structure(filtered_data)
    model = BayesianModel(edges)
    print('Fitting the data to obtain the CPDs ...')
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


def reduce_model(model, values=[]):
    """
    reduce the model by setting some features to a fix value

    :param model: the full bayesian model
    :param values: Array of tuples [(feature_name, value), ...] or a dictionary {feature_name: value, ...}
    :return: The reduced model
    """
    data = load_data()
    value_converters = get_blip_value_converters(data)
    col2index = get_col2index(data)
    values = [(key, value_converters[col2index[key]][value]) for key, value in
              (values.items() if isinstance(values, dict) else values)]
    m = model.copy()
    for variable, value in values:
        for node in m.nodes():
            cpd = m.get_cpds(node)
            if variable in cpd.get_evidence():
                cpd.reduce([(variable, value)])
                m.remove_edge(variable, node)
        m.remove_node(variable)
    m.check_model()
    return m


def get_model_feature_value_selection_map(name):
    current_dataset_model_dir = get_current_dataset_model_dir()
    if not os.path.exists(os.path.join(current_dataset_model_dir, 'feature_value_selection_map.' + name)):
        return {}
    with open(os.path.join(current_dataset_model_dir, 'feature_value_selection_map.' + name), mode='r') as file:
        return json.load(file)


def update_model_feature_value_selection_map(name, feature_value_selection_map):
    """
    Update the model feature value selection

    :param name: Name of the model
    :param feature_value_selection_map: the value of features --- dict<str, str || number || boolean>
    :return: feature_value_selection_map
    """
    with open(os.path.join(get_current_dataset_model_dir(), 'feature_value_selection_map.' + name), mode='w+') as file:
        json.dump(feature_value_selection_map, file, indent='\t')
    with open(model_config_dir, mode='r+') as file:
        config = json.load(file)
        status = config[get_current_dataset_name()]
        models = status['models']
        models[name]['feature_value_selection_map_file'] = 'feature_value_selection_map.' + name
        file.seek(0)
        json.dump(config, file, indent='\t')
        file.truncate()
    return feature_value_selection_map
