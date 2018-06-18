from flask import Blueprint, jsonify, request

from modules.service.model_utils import get_model

blueprint = Blueprint('api', __name__)

@blueprint.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status':'success',
        'messge':'pong'
    })

@blueprint.route('/loadmodel', methods=['GET'])
def load_model():
    model = get_model()
    edges = model.edges()
    edge_list = [dict(source=s, target=t) for s, t in edges]
    return jsonify(edge_list)
