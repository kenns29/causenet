import os
import pickle
import subprocess
import re
from pgmpy.models import BayesianModel
from pgmpy.estimators import BayesianEstimator
from modules.service.data_utils import to_blip_str, get_index2col
from setup import blip_data_dir, blip_dir, model_dir


def get_model(name):
    with open(model_dir + '/' + name, mode='rb') as file:
        return pickle.load(file)


def write_model(model, name):
    with open(model_dir + '/' + name, mode='wb') as file:
        pickle.dump(model, file)
        return model


def get_weighted_edges(name):
    if not os.path.exists(model_dir + '/weight.' + name):
        return None
    with open(model_dir + '/weight.' + name, mode='rb') as file:
        return pickle.load(file)


def write_weighted_edges(edges, name):
    with open(model_dir + '/weight.' + name, mode='wb') as file:
        pickle.dump(edges, file)


def blip_learn_structure(data):
    blip_data = to_blip_str(data)
    index2col = get_index2col(data)
    with open(blip_data_dir + '/input.dat', mode='w+', encoding='utf-8') as score_file:
        score_file.write(blip_data)
    subprocess.check_call([
        'java -jar ' + blip_dir + ' scorer.sq -c bdeu -d '
        + blip_data_dir + '/input.dat -j ' + blip_data_dir + '/score.jkl -n 3 -t 10' + ';'
        'java -jar ' + blip_dir + ' solver.kg.adv -smp ent -d ' + blip_data_dir + '/input.dat -j '
        + blip_data_dir + '/score.jkl -r ' + blip_data_dir + '/structure.res -t 10 -w 4 -v 1'
    ], shell=True)

    with open(blip_data_dir + '/structure.res', mode='r', encoding='utf-8') as structure_file:
        structure = structure_file.read()
        m = re.findall(r'(?:\b(\d+):\s+(?:-?\d+(?:\.\d+)?)\s+(?:\((\d+)(?:,(\d+))*\)))', structure)
        edges = []
        for t in m:
            parent = index2col[int(t[0])]
            for child in [index2col[int(value)] for index, value in enumerate(t[1:]) if value]:
                edges.append((parent, child))
        return edges


def train_model(data, name):
    edges = blip_learn_structure(data)
    model = BayesianModel(edges)
    model.fit(data, estimator=BayesianEstimator, prior_type='BDeu')
    write_model(model, name)
    return model
