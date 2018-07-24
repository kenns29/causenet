from flask import Blueprint, jsonify, request, redirect, url_for
from modules.service.model_utils import get_model, delete_model, blip_learn_structure, train_model, \
    get_weighted_edges, write_weighted_edges, get_model_list
from modules.service.edge_weights import get_edge_weights
from modules.service.data_utils import load_data, load_pdist, load_clustering, get_current_dataset_name, \
    get_dataset_config, update_current_dataset_name as update_current_dataset_name_util
from modules.service.clustering_utils import tree2dict, tree_to_non_binary_dict
from scipy.cluster.hierarchy import to_tree

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
    return jsonify(load_pdist().tolist())


@blueprint.route('/load_clustering_tree', methods=['GET'])
def load_clustering_tree():
    return jsonify(tree_to_non_binary_dict(to_tree(load_clustering())))


@blueprint.route('/load_clustering_binary_tree', methods=['GET'])
def load_clustering_binary_tree():
    return jsonify(tree2dict(to_tree(load_clustering())))


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
