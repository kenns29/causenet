import os
from setup import model_dir, blip_data_dir, data_dir, metadata_dir


def initialize():
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    if not os.path.exists(blip_data_dir):
        os.makedirs(blip_data_dir)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(metadata_dir):
        os.makedirs(metadata_dir)
