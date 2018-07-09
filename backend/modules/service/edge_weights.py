from functools import reduce
import math


def row(i, table):
    return table[i]


def col(j, table):
    return [table[i][j] for i, _ in enumerate(table)]


def get_prior(cpd):
    table = cpd.get_values()
    ev = cpd.get_evidence()
    if not ev:
        return col(0, table)
    return [sum(v) / float(len(v)) for v in table]


def get_priors(model):
    return dict((node, get_prior(model.get_cpds(node))) for node in model.nodes())


def enumerate_evidences(ev, card):
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


def get_edge_weight(edge, model, priors):
    (x, y) = edge
    cpd = model.get_cpds(y)
    evidences = cpd.get_evidence()
    card = cpd.get_cardinality(evidences)
    table = cpd.get_values()
    parentsY = [p for p in model.get_parents(y) if p != x]
    prX = priors[x]
    weight = 0
    XZ = enumerate_cpd_evidences(cpd)
    xz2index = get_evidence_enumeration2index(XZ)
    Z = enumerate_evidence_dicts(parentsY, card)
    for z in Z if Z else [{}]:
        prz = reduce(lambda pre, cur: pre * cur, [priors[key][value] for key, value in z.items()]) if z else 1
        xi2xz = dict((xi, enumeration_dict2tuple(evidences, {x: xi, **z})) for xi in range(len(prX)))
        pp = 0
        for xi, prx in enumerate(prX):
            xz = xi2xz[xi]
            pyxz = 0
            for j in range(len(table)):
                p = table[j][xz2index[xz]]
                pyz = 0
                for k in range(card[x]):
                    kz = xi2xz[k]
                    pyz += table[j][xz2index[kz]]
                pyz /= card[x]
                p *= math.log(p / pyz)
                pyxz += p
            pp += prx * pyxz
        weight += prz * pp
    return weight


def get_edge_weights(model):
    edges = model.edges()
    priors = get_priors(model)
    return [tuple([edge, get_edge_weight(edge, model, priors)]) for edge in edges]
