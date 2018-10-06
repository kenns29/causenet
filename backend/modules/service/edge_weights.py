"""
Utilities for computing the edge weights using mutual information.

Reference:
[1] Nicholson, Ann E., and Nathalie Jitnah. "Using mutual information to determine relevance in Bayesian networks."
In Pacific rim international conference on artificial intelligence, pp. 399-410. Springer, Berlin, Heidelberg, 1998.
<http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.56.8930&rep=rep1&type=pdf>
"""
from bn_edge_weights import get_edge_weight as edge_weight


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


def get_edge_weight(edge, model, priors):
    (x, y) = edge
    cpd = model.get_cpds(y)
    evidences = cpd.get_evidence()
    cards = cpd.get_cardinality(evidences)
    table = cpd.get_values().tolist()
    ei2card = [cards[e] for e in evidences]
    ei2prior = [priors[e] for e in evidences]
    xei = evidences.index(x)

    print('Each edge weight ...')
    print(edge)
    print(xei)
    print(table)
    print(ei2card)
    print(ei2prior)

    return edge_weight(xei, table, ei2card, ei2prior)


def get_edge_weights(model):
    """
    Compute the weights of edges in the Bayesian Network model

    :param model: Bayesian Network model with fitted CPDs -- BayesianModel
    :return: A list of tuples with the following format [((A, B), W), ...], in which the tuple (A, B) is the edge and
    W is the weight.
    """
    edges = model.edges()
    priors = get_priors(model)
    return [tuple([edge, get_edge_weight(edge, model, priors)]) for edge in edges]
