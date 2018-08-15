import os

version = '0.1.0.dev0'

base_dir = os.path.abspath(os.path.dirname(__file__))

config_dir = base_dir + '/config.json'

data_dir = base_dir + '/data'

data_config_dir = data_dir + '/config.json'

model_dir = base_dir + '/models'

model_config_dir = model_dir + '/config.json'

blip_data_dir = base_dir + '/blip_data'

jars_dir = base_dir + '/jars'

blip_dir = jars_dir + '/blip.jar'

metadata_dir = base_dir + '/metadata'
