import numpy as np
import bn_edge_weights as bn


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


def test_bn_edge_weight():
    from bn_edge_weights import get_edge_weight

    def row(i, table):
        return table[i]

    def col(j, table):
        return [table[i][j] for i, _ in enumerate(table)]

    def get_prior(cpd):
        """
        Estimate the prior probability of a variable given its CPD, the prior for a value is estimated by averaging all
        conditional probabilities with that value

        :param cpd: CPD of the variable -- TabularCPD
        :return: A list of prior probabilities for all the values of the variable
        """
        table = cpd.get_values()
        ev = cpd.get_evidence()
        if not ev:
            return col(0, table)
        return [sum(v) / float(len(v)) for v in table]

    def get_priors(model):
        return dict((node, get_prior(model.get_cpds(node))) for node in model.nodes())

    model = get_bn_test_model()
    priors = get_priors(model)

    edge = ('B', 'D')

    (x, y) = edge
    cpd = model.get_cpds(y)
    evidences = cpd.get_evidence()
    cards = cpd.get_cardinality(evidences)
    table = cpd.get_values().tolist()

    ei2card = [cards[e] for e in evidences]
    ei2prior = [priors[e] for e in evidences]
    xei = evidences.index(x)

    print('parameters')
    print(xei)
    print(table)
    print(ei2card)
    print(ei2prior)

    return get_edge_weight(xei, table, ei2card, ei2prior)


def test_bn_edge_weights():
    from modules.service.edge_weights import get_edge_weights
    model = get_bn_test_model()
    return get_edge_weights(model);


if __name__ == '__main__':
    # print(bn.get_edge_weight(0, [], [4, 5, 6], []))
    # print(test_bn_edge_weight())
    print(test_bn_edge_weights())
    print('---')
