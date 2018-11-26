def get_bn_test_model():
    from pgmpy.models import BayesianModel
    from pgmpy.factors.discrete import TabularCPD

    edges = [('A', 'T'), ('S', 'C'), ('S', 'B'), ('T', 'O'), ('C', 'O'), ('O', 'X'), ('O', 'D'), ('B', 'D')]

    model = BayesianModel(edges)

    cpdA = TabularCPD(variable='A',
                      variable_card=2,
                      values=[[0.01],
                              [0.99]])
    cpdS = TabularCPD(variable='S',
                      variable_card=2,
                      values=[[0.5],
                              [0.5]])
    cpdT = TabularCPD(variable='T',
                      variable_card=2,
                      evidence=['A'],
                      evidence_card=[2],
                      values=[[0.05, 0.01],
                              [0.95, 0.99]])
    cpdC = TabularCPD(variable='C',
                      variable_card=2,
                      evidence=['S'],
                      evidence_card=[2],
                      values=[[0.1, 0.01],
                              [0.9, 0.99]])
    cpdB = TabularCPD(variable='B',
                      variable_card=2,
                      evidence=['S'],
                      evidence_card=[2],
                      values=[[0.6, 0.3],
                              [0.4, 0.7]])
    cpdO = TabularCPD(variable='O',
                      variable_card=2,
                      evidence=['T', 'C'],
                      evidence_card=[2, 2],
                      values=[[0.99, 0.99, 0.99, 0.01],
                              [0.01, 0.01, 0.01, 0.99]])
    cpdX = TabularCPD(variable='X',
                      variable_card=2,
                      evidence=['O'],
                      evidence_card=[2],
                      values=[[0.98, 0.05],
                              [0.02, 0.95]])
    cpdD = TabularCPD(variable='D',
                      variable_card=2,
                      evidence=['O', 'B'],
                      evidence_card=[2, 2],
                      values=[[0.9, 0.7, 0.8, 0.1],
                              [0.1, 0.3, 0.2, 0.9]])
    model.add_cpds(cpdA, cpdS, cpdT, cpdC, cpdB, cpdO, cpdX, cpdD)

    model.check_model()
    return model


def test_bn_edge_weights():
    from modules.service.edge_weights import get_edge_weights
    model = get_bn_test_model()
    return get_edge_weights(model)


def test_cards_permutation():
    from bn_edge_weights import get_cards_permutation
    return get_cards_permutation([6, 7, 8])


def test_learn_parameters():
    from modules.service.model_utils import learn_parameters
    from modules.service.data_utils import load_data, get_index2col
    index2col = get_index2col(load_data())
    parameters = learn_parameters(index2col)
    return parameters


if __name__ == '__main__':
    # import json
    # # print(test_bn_edge_weights())
    # # print(test_cards_permutation())
    # # print(json.dumps(test_learn_parameters(), indent='\t'))
    print('---')
