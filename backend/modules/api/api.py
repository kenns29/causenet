from flask import Blueprint, jsonify, request, redirect, url_for
from modules.service.model_utils import get_model, delete_model, blip_learn_structure, train_model, \
    get_weighted_edges, write_weighted_edges, get_model_list
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
    index2col = get_index2col(load_data())
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
    return jsonify(get_index2col(load_data()))


@blueprint.route('/load_distance_map', methods=['GET'])
def load_distance_map():
    distances = load_pdist()
    n_len = load_data().shape[1]
    return jsonify(dict((str(s) + '-' + str(t), distances[i])
                        for i, (s, t) in enumerate(combinations(range(n_len), 2))))


@blueprint.route('/load_clustering_tree', methods=['GET'])
def load_clustering_tree():
    index2col = get_index2col(load_data())
    return jsonify(tree_to_non_binary_dict(to_tree(load_clustering()), index2col))


@blueprint.route('/load_clustering_binary_tree', methods=['GET'])
def load_clustering_binary_tree():
    index2col = get_index2col(load_data())
    return jsonify(tree2dict(to_tree(load_clustering()), index2col))


@blueprint.route('/load_model', methods=['GET'])
def load_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    print('loading model {}'.format(name))
    model = get_model(name)
    print('loading edges weights ...')
    weighted_edges = get_weighted_edges(name)
    if weighted_edges is None:
        print('edge weights not found, calculation edge weights ...')
        weighted_edges = get_edge_weights(model)
        write_weighted_edges(weighted_edges, name)
    edge_list = [{'source': s, 'target': t, 'weight': w} for (s, t), w in weighted_edges]
    return jsonify(edge_list)


@blueprint.route('/delete_model', methods=['GET'])
def route_delete_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    delete_model(name)
    return redirect(url_for('.load_model_list'))


@blueprint.route('/learn_structure', methods=['GET'])
def learn_structure():
    data = load_data()
    edges = blip_learn_structure(data)
    edge_list = [{'source': s, 'target': t} for s, t in edges]
    return jsonify(edge_list)


@blueprint.route('/train_bayesian_model', methods=['GET'])
def train_bayesian_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    calc_edge_weights = str2bool(request.args.get('calc_edge_weights')) \
        if request.args.get('calc_edge_weights') else True
    data = load_data()
    print('training models ...')
    model = train_model(data, name)
    if calc_edge_weights:
        print('calculating edge weights ...')
        weighted_edges = get_edge_weights(model)
        write_weighted_edges(weighted_edges, name)
        return jsonify([{'source': s, 'target': t, 'weight': w} for (s, t), w in weighted_edges])
    else:
        edges = model.edges()
        return jsonify([{'source': s, 'target': t} for s, t in edges])


@blueprint.route('/load_model_list', methods=['GET'])
def load_model_list():
    return jsonify(get_model_list())
