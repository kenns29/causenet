from flask import Blueprint, jsonify, request

from modules.service.model_utils import get_model, blip_learn_structure, train_model
from modules.service.edge_weights import get_edge_weights
from modules.service.data_utils import load_qcut_5_data

blueprint = Blueprint('api', __name__)


@blueprint.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'success',
        'messge': 'pong'
    })


@blueprint.route('/load_model', methods=['GET'])
def load_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    print('loading model {}'.format(name))
    model = get_model(name)
    print('calculating edges weights ...')
    weighted_edges = get_edge_weights(model)
    edge_list = [{'source': s, 'target': t, 'weight': w} for (s, t), w in weighted_edges]
    print('sending edges ...')
    return jsonify(edge_list)


@blueprint.route('/learn_structure', methods=['GET'])
def learn_structure():
    data = load_qcut_5_data()
    edges = blip_learn_structure(data)
    edge_list = [{'source': s, 'target': t} for s, t in edges]
    return jsonify(edge_list)


@blueprint.route('/train_bayesian_model', methods=['GET'])
def train_bayesian_model():
    name = request.args.get('name') if request.args.get('name') else 'model.bin'
    data = load_qcut_5_data()
    train_model(data, name)
    return jsonify({
        'status': 0
    })
