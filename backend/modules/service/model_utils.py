import os, pickle, subprocess, re, json, csv
from collections import OrderedDict
from pandas import DataFrame, cut
from pgmpy.factors.discrete.CPD import TabularCPD
from pgmpy.models import BayesianModel
from modules.service.data_utils import get_current_dataset_name, get_index2col, \
    get_col2index, get_blip_value_converters, load_data, is_temporal_data, get_times, to_blip_csv
from modules.service.utils import edges_to_child_adjacency_dict
from modules.service.edge_weights import get_edge_weights
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
    with open(os.path.join(get_current_dataset_model_dir(), name), mode='rb') as file:
        return pickle.load(file)


def write_model(model, name):
    current_dataset_name = get_current_dataset_name()
    with open(os.path.join(get_current_dataset_model_dir(), name), mode='wb') as file:
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
        if os.path.exists(os.path.join(current_dataset_model_dir, name)):
            os.remove(os.path.join(current_dataset_model_dir, name))
        if os.path.exists(os.path.join(current_dataset_model_dir, 'weight.' + name)):
            os.remove(os.path.join(current_dataset_model_dir, 'weight.' + name))
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


def get_sub_models(name):
    sub_models_dir = os.path.join(get_current_dataset_model_dir(), 'sub-models.' + name)
    model_dict = dict()
    for subdir, dirs, files in os.walk(sub_models_dir):
        for key in files:
            with open(os.path.join(sub_models_dir, key), mode='rb') as file:
                model_dict[key] = pickle.load(file)
    return model_dict


def write_sub_models_within_cluster(model_dict, model_name):
    if not model_dict:
        return model_dict
    current_dataset_name = get_current_dataset_name()
    sub_models_dir = os.path.join(get_current_dataset_model_dir(), 'sub-models.' + model_name)
    if not os.path.exists(sub_models_dir):
        os.makedirs(sub_models_dir)
    for key, model in model_dict.items():
        with open(os.path.join(sub_models_dir, str(key)), mode='wb') as file:
            pickle.dump(model, file)
    with open(model_config_dir, mode='r+', encoding='utf-8') as file:
        config = json.load(file)
        status = config[current_dataset_name]
        models = status['models']
        models[model_name]['sub-models-folder'] = 'sub-models.' + model_name
        file.seek(0)
        json.dump(config, file, indent='\t')
        file.truncate()
    return model_dict


def write_sub_models_edge_weights(weighted_edges_dict, model_name):
    sub_models_dir = os.path.join(get_current_dataset_model_dir(), 'sub-models.' + str(model_name))
    if not os.path.exists(sub_models_dir):
        os.makedirs(sub_models_dir)
    for key, weighted_edges in weighted_edges_dict.items():
        with open(os.path.join(sub_models_dir, 'weight.' + str(key)), mode='wb') as file:
            pickle.dump(weighted_edges, file)
    return weighted_edges_dict


def blip_learn_structure(data):
    """
    Learn the Bayesian Network Structure using the blip java library:
    <https://github.com/mauro-idsia/blip>
    Using python subprocess to invoke the library executable, which is stored in backend/jars/

    :param data: Pandas DataFrame
    :return: edges in list of tuples
    """
    print('generating inputs ...')
    to_blip_csv(data)
    print('computing tree-width ...')
    subprocess.check_call(
        'java -jar ' + blip_dir + ' scorer.sq -c bdeu -d '
        + os.path.join(blip_data_dir, 'input.dat') + ' -j '
        + os.path.join(blip_data_dir, 'score.jkl') + ' -n 3 -t 10', shell=True)
    print('learning the structure ...')
    subprocess.check_call(
        'java -jar ' + blip_dir + ' solver.kg.adv -smp ent -d ' + os.path.join(blip_data_dir, 'input.dat') + ' -j '
        + os.path.join(blip_data_dir, 'score.jkl') + ' -r '
        + os.path.join(blip_data_dir, 'structure.res') + ' -t 10 -w 4 -v 1', shell=True)


def parse_blip_edges(index2col, with_score=False, with_overall_score=False, output_format='edges'):
    if output_format != 'edges' and output_format != 'child_adjacency_ordered_dict':
        raise ValueError('output_format should be either edges or child_adjacency_ordered_dict')

    with open(os.path.join(blip_data_dir, 'structure.res'), mode='r', encoding='utf-8') as structure_file:
        # Parse the result from the blip library
        structure = [] if output_format == 'edges' else OrderedDict()
        line = structure_file.readline()
        while line and line != '\n':
            m = re.findall(r'(?:\b(\d+):\s+(-?\d+(?:\.\d+)?)\s+(?:\((\d+)(?:,(\d+))*\))?)', line)
            t = m[0]
            child = index2col[int(t[0])]
            score = float(t[1])
            if output_format == 'edges':
                for parent in [index2col[int(value)] for index, value in enumerate(t[2:]) if value]:
                    structure.append((parent, child, score) if with_score else (parent, child))
            elif output_format == 'child_adjacency_ordered_dict':
                structure[child] = {
                    'parents': [index2col[int(value)] for index, value in enumerate(t[2:]) if value]
                }
                if with_score:
                    structure[child]['score'] = score
            line = structure_file.readline()

        line = structure_file.readline()
        m = re.search(re.compile(r'-?\d+(?:\.\d+)?'), line)
        overall_score = float(m.group())
    return structure if not with_overall_score else (structure, overall_score)


def bilp_filter_backward_edges(index2col, col2index):
    print('filtering backward edges ...')
    if not index2col or type(index2col[0]) is not str or not re.match(re.compile(r'.+~\d{4}'), index2col[0]):
        print('non-temporal variables detected, skip filtering ...')
        return
    structure, overall_score = parse_blip_edges(index2col,
                                                with_score=True,
                                                with_overall_score=True,
                                                output_format='child_adjacency_ordered_dict')
    with open(os.path.join(blip_data_dir, 'structure.res'), mode='w', encoding='utf-8') as structure_file:
        for child, parents_info in structure.items():
            parents = parents_info['parents']
            score = parents_info['score']
            child_year = int(child.split('~')[1])
            child_index = col2index[child]
            filtered_parent_indexes = []
            for parent in parents:
                parent_year = int(parent.split('~')[1])
                if parent_year <= child_year:
                    filtered_parent_indexes.append(col2index[parent])

            structure_file.write('{}: {} '.format(child_index, score))
            if filtered_parent_indexes:
                structure_file.write(' ({})'.format(','.join([str(parent_index)
                                                              for parent_index in filtered_parent_indexes])))
            structure_file.write('\n')
        structure_file.write('\nScore: {} '.format(overall_score))


def learn_structure(data, index2col=None, col2index=None):
    blip_learn_structure(data)
    index2col = index2col if index2col is not None else get_index2col(data)
    col2index = col2index if col2index is not None else get_col2index(data)
    bilp_filter_backward_edges(index2col, col2index)
    return parse_blip_edges(index2col)


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


def blip_learn_parameters(data=None, edges=None):
    if data is not None:
        to_blip_csv(data)
    if edges is not None:
        if data is None:
            raise ValueError('data must be not None when edges are specified in the arguments.')
        col2index = get_col2index(data)
        child_adjacency_dict = edges_to_child_adjacency_dict(edges)
        with open(os.path.join(blip_data_dir, 'structures.res'), mode='w+') as structure_file:
            for child, parent_set in child_adjacency_dict.items():
                structure_file.write(str(col2index[child]) + ': -200 ('
                                     + ','.join(str(col2index[p]) for p in parent_set) + ')')

    subprocess.check_call('java -jar ' + blip_dir + ' parle -d '
                          + os.path.join(blip_data_dir, 'input.dat') + ' -r '
                          + os.path.join(blip_data_dir, 'structure.res') + ' -n '
                          + os.path.join(blip_data_dir, 'parameters.uai'), shell=True)


def learn_parameters(index2col, data=None, edges=None):
    blip_learn_parameters(data, edges)
    return parse_blip_parameters_uai(index2col)


def blip_cpds_to_pgmpy_cpds(cpds):
    for cpd in cpds:
        cpd['values'] = [*zip(*cpd['values'])]
    return [TabularCPD(**cpd) for cpd in cpds]


def filter_cpds_by_edges(cpds, edges):
    node_set = set()
    for s, t in edges:
        node_set.add(s)
        node_set.add(t)
    return [cpd for cpd in cpds if cpd.variable in node_set]


def train_model(data, name=None, feature_selection=None, do_write_model=True):
    feature_selection = get_feature_selection() if feature_selection is None else feature_selection
    if is_temporal_data(data):
        feature_selection = [feature + '~' + str(time)
                             for feature in feature_selection for time in get_times(data, feature)] \
            if feature_selection is not None else None
    filtered_data = data.filter(feature_selection) if feature_selection is not None else data
    if filtered_data.shape[1] < 2:
        print('number of features < 2, skip training ...')
        return None
    index2col = get_index2col(filtered_data)
    col2index = get_col2index(filtered_data)
    edges = learn_structure(filtered_data, index2col, col2index)
    model = BayesianModel(edges)
    print('fitting the data to obtain the CPDs ...')
    cpds = blip_cpds_to_pgmpy_cpds(learn_parameters(index2col))
    filtered_cpds = filter_cpds_by_edges(cpds, edges)
    model.add_cpds(*filtered_cpds)
    model.check_model()
    if do_write_model:
        write_model(model, name)
    return model


def train_model_on_clusters(clusters, name, base_avg_data=None):
    base_avg_data = load_data('base_avg_data_file') if base_avg_data is None else base_avg_data
    data = DataFrame(columns=range(len(clusters)), index=base_avg_data.index)
    for key, cluster in enumerate(clusters) if type(clusters) is list else clusters.items():
        data[key] = base_avg_data.filter(cluster).mean(axis=1)
    if data.shape[1] < 2:
        print('number of features < 2, skip training ...')
        return None
    # temporally hard code the number of cut to 10
    cut_n = 10
    for key in data:
        data[key] = cut(data[key], cut_n)
    index2col = get_index2col(data)
    col2index = get_col2index(data)
    edges = learn_structure(data, index2col, col2index)
    model = BayesianModel(edges)
    cpds = blip_cpds_to_pgmpy_cpds(learn_parameters(index2col))
    filtered_cpds = filter_cpds_by_edges(cpds, edges)
    model.add_cpds(*filtered_cpds)
    model.check_model()
    write_model(model, name)
    return model


def train_sub_model_within_clusters(clusters, data=None, name=None):
    data = load_data() if data is None else data
    model_dict = dict()
    for key, cluster in enumerate(clusters) if type(clusters) is list else clusters.items():
        model = train_model(data, feature_selection=cluster, do_write_model=False)
        if model:
            model_dict[key] = model
    if model_dict:
        write_sub_models_within_cluster(model_dict, name)
    return model_dict


def calc_sub_models_edge_weights(model_dict, model_name):
    if not model_dict:
        return model_dict
    weighted_edges_dict = dict((key, get_edge_weights(model)) for key, model in model_dict.items())
    write_sub_models_edge_weights(weighted_edges_dict, model_name)
    return weighted_edges_dict


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
