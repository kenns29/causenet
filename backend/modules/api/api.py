from flask import Blueprint, jsonify, request

from modules.service.model_utils import get_fitted_model, blip_learn_structure
from modules.service.edge_weights import get_edge_weights
from modules.service.data_utils import load_qcut_5_data

blueprint = Blueprint('api', __name__)


@blueprint.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'success',
        'messge': 'pong'
    })


@blueprint.route('/loadmodel', methods=['GET'])
def load_model():
    model = get_fitted_model()
    weighted_edges = get_edge_weights(model)
    edge_list = [{'source': s, 'target': t, 'weight': w} for (s, t), w in weighted_edges]
    return jsonify(edge_list)


@blueprint.route('/learn_structure', methods=['GET'])
def learn_structure():
    data = load_qcut_5_data()
    edges = blip_learn_structure(data)
    edge_list = [{'source': s, 'target': t} for s, t in edges]
    return jsonify(edge_list)
