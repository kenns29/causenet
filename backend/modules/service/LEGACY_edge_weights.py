"""
Utilities for computing the edge weights using mutual information.

Reference:
[1] Nicholson, Ann E., and Nathalie Jitnah. "Using mutual information to determine relevance in Bayesian networks."
In Pacific rim international conference on artificial intelligence, pp. 399-410. Springer, Berlin, Heidelberg, 1998.
<http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.56.8930&rep=rep1&type=pdf>
"""
from functools import reduce
import math


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


def enumerate_evidences(ev, card):
    """
    Enumerate all cardinality of the evidences (TODO: replace this function with the itertools.combinations utility)

    :param ev: evidences -- List
    :param card: cardinality of each of the evidences -- dict<str, int>
    :return: A list of tuples that enumerates all the possible combinations of the cardinality
    """
    def recurse(i, ev, card, stack, tuples):
        ev_len = len(ev)
        if i >= ev_len:
            tuples.append(tuple([stack[ev_len - index - 1] for index, key in enumerate(ev)]))
            return
        n = card[ev[i]]
        for k in range(n):
            stack.append(k)
            recurse(i + 1, ev, card, stack, tuples)
            stack.pop()
    tuples = []
    if ev:
        recurse(0, ev[::-1], card, [], tuples)
    return tuples


def get_evidence2index(ev):
    return dict((variable, index) for index, variable in enumerate(ev))


def enumeration_tuple2dict(ev, ev_tuple):
    return dict((ev[index], value) for index, value in enumerate(ev_tuple))


def enumeration_dict2tuple(ev, ev_dict):
    return tuple([ev_dict[variable] for variable in ev])


def enumerate_evidence_dicts(ev, card):
    return [enumeration_tuple2dict(ev, ev_tuple) for ev_tuple in enumerate_evidences(ev, card)]


def get_evidence_enumeration2index(enumerations):
    return dict((t, index) for index, t in enumerate(enumerations))


def enumerate_cpd_evidences(cpd):
    ev = cpd.get_evidence()
    card = cpd.get_cardinality(ev)
    return enumerate_evidences(ev, card)


def enumerate_cpd_evidence_dicts(cpd):
    ev = cpd.get_evidence()
    card = cpd.get_cardinality(ev)
    return enumerate_evidence_dicts(ev, card)


def get_enumeration_index(enumeration, cards):
    index = enumeration[0]
    prod = 1
    for i in range(1, len(cards)):
        index += cards[i - 1] * prod * enumeration[i]
        prod *= cards[i - 1]
    return index


def get_edge_weight(edge, model, priors):
    """
    Compute the weight of the edge based on the fitted CPDs. This is an implementation of the equation
    in section 3.2 of Nicholson et. al[1]

    :param edge: A tuple of str, (A, B), indicating an edge from A to B -- tuple
    :param model: Bayesian Network model with fitted CPDs -- BayesianModel
    :param priors: The estimated prior probabilities of each variables in the model -- list<float>
    :return: weight -- float
    """
    (x, y) = edge
    cpd = model.get_cpds(y)
    evidences = cpd.get_evidence()
    cards = cpd.get_cardinality(evidences)
    table = cpd.get_values()
    pr_x = priors[x]
    weight = 0

    ei2card = [cards[e] for e in evidences]
    ei2prior = [priors[e] for e in evidences]
    xei = evidences.index(x)
    ev = list(range(0, len(evidences)))
    yev = [ei for ei in ev if ei != xei]
    ei2yei = dict((ei, yei) for yei, ei in enumerate(yev))

    Z = enumerate_evidences(yev, ei2card)

    for z in Z if Z else [None]:
        prz = reduce(lambda pre, cur: pre * cur, [ei2prior[yev[e]][c] for e, c in enumerate(z)]) if z else 1
        zenum = [z[ei2yei[ei]] if ei != xei else -1 for ei in ev]
        xi2ti = [None] * cards[x]
        for xi in range(cards[x]):
            zenum[xei] = xi
            xi2ti[xi] = get_enumeration_index(zenum, ei2card)
        yj2pyz = [sum([t_row[xi2ti[xi]] for xi in range(cards[x])]) / cards[x] for t_row in table]
        weight += prz * sum([prx * sum([p * math.log(p / yj2pyz[j]) for j, p in
                                        [(j, t_row[xi2ti[xi]]) for j, t_row in enumerate(table)]])
                             for xi, prx in enumerate(pr_x)])
    return weight


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
