from flask import Blueprint, jsonify, request, redirect, url_for, json
from modules.service.model_utils import get_model, delete_model, learn_structure, train_model, \
    get_weighted_edges, write_weighted_edges, get_model_list, update_feature_selection, get_feature_selection, \
    update_model_feature_value_selection_map, get_model_feature_value_selection_map, reduce_model, \
    train_model_on_clusters, train_sub_model_within_clusters, calc_sub_models_edge_weights, get_sub_models, \
    get_full_model_features, get_model_clusters, replace_sub_models
from modules.service.edge_weights import get_edge_weights
from modules.service.data_utils import load_data, load_pdist, load_clustering, get_current_dataset_name, \
    get_dataset_config, update_current_dataset_name as update_current_dataset_name_util, get_index2col
from modules.service.clustering_utils import tree2dict, tree_to_non_binary_dict
from scipy.cluster.hierarchy import to_tree
from itertools import combinations

blueprint = Blueprint('api', __name__)


def str2bool(value):
    return value and value == 'True'


@blueprint.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'success',
        'message': 'pong'
    })


@blueprint.route('/load_current_dataset_name', methods=['GET'])
def load_current_dataset_name():
    return jsonify({'name': get_current_dataset_name()})


@blueprint.route('/update_current_dataset_name', methods=['GET'])
def update_current_dataset_name():
    name = request.args.get('name') if request.args.get('name') else ''
    return jsonify({'name': update_current_dataset_name_util(name)})


@blueprint.route('/load_dataset_list', methods=['GET'])
def load_dataset_list():
    return jsonify([{'name': key} for key, _ in get_dataset_config().items()])


@blueprint.route('/load_clustering', methods=['GET'])
def route_load_clustering():
    return jsonify(load_clustering().tolist())


@blueprint.route('/load_distances', methods=['GET'])
def load_distances():
    distances = load_pdist()
    index2col = get_index2col(load_data('base_avg_data_file'))
    n_len = len(index2col)
    return jsonify([
        {
            'source': {
                'id': s,
                'name': index2col[s]
            },
            'target': {
                'id': t,
                'name': index2col[t]
            },
            'dist': distances[i]
        } for i, (s, t) in enumerate(combinations(range(n_len), 2))])


@blueprint.route('/load_id2name', methods=['GET'])
def load_id2name():
    return jsonify(get_index2col(load_data('data_file')))


@blueprint.route('/load_distance_map', methods=['GET'])
def load_distance_map():
    distances = load_pdist()
    n_len = load_data('base_avg_data_file').shape[1]
    return jsonify(dict((str(s) + '-' + str(t), distances[i])
                        for i, (s, t) in enumerate(combinations(range(n_len), 2))))


@blueprint.route('/load_clustering_tree', methods=['GET'])
def load_clustering_tree():
    index2col = get_index2col(load_data('base_avg_data_file'))
    return jsonify(tree_to_non_binary_dict(to_tree(load_clustering()), index2col))


@blueprint.route('/load_clustering_binary_tree', methods=['GET'])
def load_clustering_binary_tree():
    index2col = get_index2col(load_data('base_avg_data_file'))
    return jsonify(tree2dict(to_tree(load_clustering()), index2col))


@blueprint.route('/load_model', methods=['GET'])
def load_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    print('loading model {} ...'.format(name))
    model = get_model(name)
    print('loading edges weights ...')
    weighted_edges = get_weighted_edges(name)
    if weighted_edges is None:
        print('edge weights not found, calculating edge weights ...')
        weighted_edges = get_edge_weights(model)
        write_weighted_edges(weighted_edges, name)
    return jsonify([{'source': str(s), 'target': str(t), 'weight': w} for (s, t), w in weighted_edges])


@blueprint.route('/load_modified_model', methods=['GET'])
def load_modifed_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    print('loading modified model {} ...'.format(name))
    feature_value_selection_map = get_model_feature_value_selection_map(name)
    if not feature_value_selection_map:
        print('no modification on model, loading the full model {} ...'.format(name))
        return redirect(url_for('.load_model', name=name))
    model = get_model(name)
    print('reducing the model {} ...'.format(name))
    reduced_model = reduce_model(model, feature_value_selection_map)
    print('calculating edge weights for reduced model {} ...'.format(name))
    weighted_edges = get_edge_weights(reduced_model)
    return jsonify([{'source': str(s), 'target': str(t), 'weight': w} for (s, t), w in weighted_edges])


@blueprint.route('/load_sub_models', methods=['GET'])
def load_sub_models():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    model_dict = get_sub_models(name)
    return jsonify(dict((key, {
        'edges': [{
            'source': s,
            'target': t,
            'weight': w
        } for (s, t), w in item['weighted_edges']]
        if 'weighted_edges' in item else
        [{
            'source': s,
            'target': t
        } for s, t in item['model'].edges()],
        'nodes': item['model'].nodes()
    })
                        for key, item in model_dict.items()))


@blueprint.route('/replace_sub_models', methods=['POST'])
def route_replace_sub_models():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    params = json.loads(request.data)
    targets = params['targets']
    replacements = params['replacements']
    return replace_sub_models(name, targets, replacements)


@blueprint.route('/load_model_features', methods=['GET'])
def load_model_features():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    return jsonify([str(node) for node in get_model(name).nodes()])


@blueprint.route('/load_full_model_features', methods=['GET'])
def load_full_model_features():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    return jsonify([str(feature) for feature in get_full_model_features(name)])


@blueprint.route('/load_model_clusters', methods=['GET'])
def load_model_clusters():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    return jsonify(dict((str(key), cluster) for key, cluster in get_model_clusters(name).items()))


@blueprint.route('/load_feature_values_map', methods=['GET'])
def load_feature_values_map():
    data = load_data()
    features = request.args.get('features') if request.args.get('features') else data.keys()
    return jsonify(dict((key, data[key].cat.categories.tolist()) for key in features))


@blueprint.route('/delete_model', methods=['GET'])
def route_delete_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    delete_model(name)
    return redirect(url_for('.load_model_list'))


@blueprint.route('/learn_structure', methods=['GET'])
def route_learn_structure():
    data = load_data()
    edges = learn_structure(data)
    edge_list = [{'source': s, 'target': t} for s, t in edges]
    return jsonify(edge_list)


@blueprint.route('/train_bayesian_model', methods=['GET'])
def train_bayesian_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    feature_selection = request.args.get('feature_selection')
    calc_edge_weights = str2bool(request.args.get('calc_edge_weights')) \
        if request.args.get('calc_edge_weights') else True
    data = load_data()
    print('training models ...')
    model = train_model(data, name, feature_selection)
    if not model:
        return jsonify([])
    if calc_edge_weights:
        print('calculating edge weights ...')
        weighted_edges = get_edge_weights(model)
        write_weighted_edges(weighted_edges, name)
        return jsonify([{'source': s, 'target': t, 'weight': w} for (s, t), w in weighted_edges])
    else:
        edges = model.edges()
        return jsonify([{'source': s, 'target': t} for s, t in edges])


@blueprint.route('/train_cluster_bayesian_model', methods=['GET', 'POST'])
def train_cluster_bayesian_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    calc_edge_weights = str2bool(request.args.get('calc_edge_weights')) \
        if request.args.get('calc_edge_weights') else True
    clusters = json.loads(request.data) if request.method == 'POST' else request.args.get('clusters')
    if clusters is None or type(clusters) is not dict and type(clusters) is not list:
        raise ValueError('clusters has to be either dict or list')
    print('training model on clusters ...')
    base_avg_data = load_data('base_avg_data_file')
    model = train_model_on_clusters(clusters, name, base_avg_data)
    if not model:
        return jsonify([])
    if calc_edge_weights:
        print('calculating edge weights ...')
        weighted_edges = get_edge_weights(model)
        write_weighted_edges(weighted_edges, name)
        return jsonify([{'source': str(s), 'target': str(t), 'weight': w} for (s, t), w in weighted_edges])
    else:
        edges = model.edges()
        return jsonify([{'source': s, 'target': t} for s, t in edges])


@blueprint.route('/train_sub_bayesian_model_within_clusters', methods=['GET', 'POST'])
def route_train_sub_model_within_clusters():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    calc_edge_weights = str2bool(request.args.get('calc_edge_weights')) \
        if request.args.get('calc_edge_weights') else True
    clusters = json.loads(request.data) if request.method == 'POST' else request.args.get('clusters')
    if clusters is None or type(clusters) is not dict and type(clusters) is not list:
        raise ValueError('clusters has to be either dict or list')
    data = load_data()
    print('training sub models within clusters ...')
    model_dict = train_sub_model_within_clusters(clusters, data, name)
    if not model_dict:
        return jsonify({})
    if calc_edge_weights:
        print('calculating sub models edge weights ...')
        weighted_edges_dict = calc_sub_models_edge_weights(model_dict, name)
        return jsonify(dict((key, [{'source': s, 'target': t, 'weight': w} for (s, t), w in weighted_edges])
                            for key, weighted_edges in weighted_edges_dict.items()))
    else:
        return jsonify(dict((key, [{'source': s, 'target': t} for s, t in model.edges()])
                            for key, model in model_dict.items()))


@blueprint.route('/load_model_list', methods=['GET'])
def load_model_list():
    return jsonify([{'name': d['name'],
                     'is_cluster_model': 'sub-models-folder' in d} for d in get_model_list()])


@blueprint.route('/load_feature_selection', methods=['GET'])
def load_feature_selection():
    return jsonify(get_feature_selection())


@blueprint.route('/update_feature_selection', methods=['POST'])
def route_update_feature_selection():
    update_feature_selection(json.loads(request.data))
    return redirect(url_for('.load_feature_selection'))


@blueprint.route('/load_model_feature_value_selection_map', methods=['GET'])
def load_model_feature_value_selection_map():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    return jsonify(get_model_feature_value_selection_map(name))


@blueprint.route('/update_model_feature_value_selection_map', methods=['POST'])
def route_update_model_feature_value_selection_map():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    feature_value_selection_map = json.loads(request.data)
    update_model_feature_value_selection_map(name, feature_value_selection_map)
    return redirect(url_for('.load_model_feature_value_selection_map', name=name))
