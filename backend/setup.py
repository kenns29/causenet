import os

version = '0.1.0.dev0'

base_dir = os.path.abspath(os.path.dirname(__file__))

data_dir = base_dir + '/data'

model_dir = base_dir + '/models'

model_status_dir = model_dir + '/model_status.json'

blip_data_dir = base_dir + '/blip_data'

jars_dir = base_dir + '/jars'

blip_dir = jars_dir + '/blip.jar'
