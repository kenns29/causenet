from flask import Blueprint, jsonify, request

blueprint = Blueprint('api', __name__)

@blueprint.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status':'success',
        'messge':'pong'
    })