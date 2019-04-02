import os, pickle
from flask import Blueprint, jsonify, request, redirect, url_for, json
from modules.service.model_utils import get_model, delete_model, learn_structure, train_model, \
    get_weighted_edges, write_weighted_edges, get_model_list, update_feature_selection, get_feature_selection, \
    update_model_feature_value_selection_map, get_model_feature_value_selection_map, reduce_model, \
    train_model_on_clusters, train_sub_model_within_clusters, calc_sub_models_edge_weights, get_sub_models, \
    get_full_model_features, get_model_clusters, replace_sub_models, check_is_cluster_model, \
    calc_model_edge_correlations, train_feature_sliced_model, get_current_dataset_model_dir, \
    get_feature_sliced_model, get_feature_sliced_model_weighted_edges, get_feature_slices, model_mod_to_feature_selection, \
    get_model_mod, write_model_mod
from modules.service.edge_weights import get_edge_weights
from modules.service.data_utils import load_data, load_pdist, load_clustering, get_current_dataset_name, \
    get_dataset_config, update_current_dataset_name as update_current_dataset_name_util, get_index2col, \
    get_column_mean_aggregated_data
from modules.service.clustering_utils import tree2dict, tree_to_non_binary_dict
from modules.service.sqlite_utils.query import query_bilateral_trade_averaged_by_country_by_item_group, \
    query_countries, query_import_social_correlation_by_country_item, query_items, \
    query_trade_social_correlation_by_country_item, query_acled_events
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
    index2col = dict((index, str(col)) for index, col in get_index2col(load_data('base_avg_data_file')).items())
    return jsonify(tree_to_non_binary_dict(to_tree(load_clustering()), index2col))


@blueprint.route('/load_clustering_binary_tree', methods=['GET'])
def load_clustering_binary_tree():
    index2col = dict((index, str(col)) for index, col in get_index2col(load_data('base_avg_data_file')).items())
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
    edge_correlation_dict = dict((edge, corr) for edge, corr in calc_model_edge_correlations(name, model))
    return jsonify([{'source': str(s), 'target': str(t), 'weight': w, 'corr': edge_correlation_dict[(s, t)]}
                    for (s, t), w in weighted_edges])


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
    edge_correlation_dict = dict((edge, corr) for edge, corr in calc_model_edge_correlations(name, reduced_model))
    return jsonify([{'source': str(s), 'target': str(t), 'weight': w, 'corr': edge_correlation_dict[(s, t)]}
                    for (s, t), w in weighted_edges])


@blueprint.route('/load_feature_sliced_model', methods=['GET'])
def load_feature_sliced_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    print('loading feature sliced model {} ...'.format(name))
    model = get_feature_sliced_model(name)
    if not model:
        model = get_model(name)
    weighted_edges = get_feature_sliced_model_weighted_edges(name)
    if weighted_edges is None:
        weighted_edges = get_weighted_edges(name)
    edge_correlation_dict = dict((edge, corr) for edge, corr in calc_model_edge_correlations(name, model))
    return jsonify([{'source': str(s), 'target': str(t), 'weight': w, 'corr': edge_correlation_dict[(s, t)]}
                    for (s, t), w in weighted_edges])


@blueprint.route('/load_model_feature_slices', methods=['GET'])
def load_model_feature_slices():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    feature_slices = get_feature_slices(name)
    return jsonify(feature_slices if feature_slices else {})


@blueprint.route('/load_sub_models', methods=['GET'])
def load_sub_models():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    model_dict = get_sub_models(name)
    r_dict = dict()
    for key, item in model_dict.items():
        edge_correlation_dict = dict((edge, corr) for edge, corr in item['edge_correlations'])
        if 'weighted_edges' in item:
            edges = [{
                'source': s,
                'target': t,
                'weight': w,
                'corr': edge_correlation_dict[(s, t)]
            } for (s, t), w in item['weighted_edges']]
        else:
            edges = [{
                'source': s,
                'target': t,
                'corr': edge_correlation_dict[(s, t)]
            } for s, t in item['model'].edges()]
        r_dict[key] = {'nodes': item['model'].nodes(), 'edges': edges}
    return jsonify(r_dict)


@blueprint.route('/replace_sub_models', methods=['POST'])
def route_replace_sub_models():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    params = json.loads(request.data, parse_int=str)
    targets = params['targets']
    replacements = params['replacements']
    model_dict = replace_sub_models(name, targets, replacements)
    return jsonify(dict((key, model.edges()) for key, model in model_dict.items()))


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
    return jsonify(dict((str(key), data[key].cat.categories.tolist()) for key in features))


@blueprint.route('/load_model_mod', methods=['GET'])
def load_model_mod():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    return jsonify(get_model_mod(name))


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


@blueprint.route('/train_bayesian_model', methods=['GET', 'POST'])
def train_bayesian_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    feature_selection = request.args.get('feature_selection')
    calc_edge_weights = str2bool(request.args.get('calc_edge_weights')) \
        if request.args.get('calc_edge_weights') else True
    mod = json.loads(request.data) if request.method == 'POST' else request.args('mod')

    print('mod= {}'.format(mod))

    feature_selection = model_mod_to_feature_selection(mod) if mod else feature_selection
    data = load_data()
    print('training models ...')
    model = train_model(data, name, feature_selection)
    if mod:
        write_model_mod(mod, name)
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


@blueprint.route('/train_feature_sliced_bayesian_model', methods=['GET', 'POST'])
def route_train_feature_sliced_bayesian_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    calc_edge_weights = str2bool(request.args.get('calc_edge_weights')) \
        if request.args.get('calc_edge_weights') else True
    if request.method == 'POST':
        post_data = json.loads(request.data)
        # clusters = post_data['clusters']
        feature_slices = post_data['feature_slices']
    else:
        # clusters = request.get('clusters')
        feature_slices = request.get('feature_slices')
    model = train_feature_sliced_model(name, feature_slices)
    if calc_edge_weights:
        weighted_edges = get_edge_weights(model)
        with open(os.path.join(get_current_dataset_model_dir(),
                               'feature-sliced-model-weight.' + name), mode='wb') as file:
            pickle.dump(weighted_edges, file)
        return jsonify([{'source': str(s), 'target': str(t), 'weight': w} for (s, t), w in weighted_edges])
    else:
        return jsonify([{'source': s, 'target': t} for s, t in model.edges()])


@blueprint.route('/load_model_list', methods=['GET'])
def load_model_list():
    return jsonify([{'name': d['name'],
                     'is_cluster_model': check_is_cluster_model(d['name'], model_stats=d)} for d in get_model_list()])


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


@blueprint.route('/load_data', methods=['GET', 'POST'])
def route_load_data():
    data_type = request.args.get('data_type') if request.args.get('data_type') else 'base_avg_data_file'
    if request.method == 'GET':
        feature_selection = request.args.get('feature_selection')
    else:
        feature_selection = json.loads(request.data) if request.data else None

    data = load_data(data_type=data_type)
    data = get_column_mean_aggregated_data(data, feature_selection) if feature_selection is not None else data
    return jsonify(dict((str(key), dict((str(index), data[str(key)][index])
                                        for index in data.index)) for key in data.keys()))


@blueprint.route('/load_cr_relations', methods=['GET'])
def route_load_cr_relations():
    cr_relations = query_bilateral_trade_averaged_by_country_by_item_group(1)
    return jsonify(cr_relations)


@blueprint.route('/load_cr_relation_features', methods=['GET'])
def route_load_relation_features():
    features = query_countries()
    return jsonify([{
        'id': d['country_code'],
        'name': d['country']
    } for d in features])


@blueprint.route('/load_cm_correlations', methods=['GET'])
def route_load_cm_correlations():
    u = request.args.get('u') if request.args.get('u') else 1
    trade_attribute = 'import_quantity' if int(u) else 'export_quantity'
    # correlations = query_import_social_correlation_by_country_item()
    correlations = query_trade_social_correlation_by_country_item(trade_attribute)
    return jsonify(correlations)


@blueprint.route('/load_fao_countries', methods=['GET'])
def route_load_fao_countries():
    countries = query_countries()
    return jsonify(countries)


@blueprint.route('/load_fao_items', methods=['GET'])
def route_load_fao_items():
    items = query_items()
    return jsonify(items)


@blueprint.route('/load_acled_event_list', methods=['GET'])
def route_load_acled_event_list():
    country = request.args.get('country')
    year_range = request.args.get('year_range')

    if country:
        country = int(country)
    if year_range:
        year_range = json.loads(year_range)

    return jsonify(query_acled_events(country=country, year_range=year_range))