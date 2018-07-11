import os
import json
from setup import model_dir, blip_data_dir, data_dir, model_status_dir


def initialize():
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    if not os.path.exists(blip_data_dir):
        os.makedirs(blip_data_dir)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    init_model_status()


def init_model_status():
    if not os.path.exists(model_status_dir):
        with open(model_status_dir, mode='w', encoding='utf-8') as file:
            json.dump({
                'models': {}
            }, file, indent='\t')
