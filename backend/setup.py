import os

version = '0.1.0.dev0'

base_dir = os.path.abspath(os.path.dirname(__file__))

config_dir = os.path.join(base_dir, 'config.json')

data_dir = os.path.join(base_dir, 'data')

data_config_dir = os.path.join(data_dir, 'config.json')

model_dir = os.path.join(base_dir, 'models')

model_config_dir = os.path.join(model_dir, 'config.json')

blip_data_dir = os.path.join(base_dir, 'blip_data')

jars_dir = os.path.join(base_dir, 'jars')

blip_dir = os.path.join(jars_dir, 'blip.jar')

metadata_dir = os.path.join(base_dir, 'metadata')

db_fao_dir = os.path.join(base_dir, 'db_fao.db')