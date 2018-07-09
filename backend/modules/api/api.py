from flask import Blueprint, jsonify, request

from modules.service.model_utils import get_fitted_model
from modules.service.edge_weights import get_edge_weights


blueprint = Blueprint('api', __name__)


@blueprint.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'success',
        'messge': 'pong'
    })


@blueprint.route('/loadmodel', methods=['GET'])
def load_model():
    print('load model ...')
    model = get_fitted_model()
    print('get edge weights ...')
    weighted_edges = get_edge_weights(model)
    edge_list = [{'source': s, 'target': t, 'weight': w} for (s, t), w in weighted_edges]
    print('sending edges ...')
    return jsonify(edge_list)
