# BN Edge Weights

## Methods

**get_edge_weight**(x, cpd, cards, priors)

Calculate the edge weight for one edge in the discrete bayesian network using mutual information.

Parameters:

    x: the index of x within y's evidence list, given the edge (x, y).
    cpd: the list that represents the conditional probability distribution table.
    cards: the list of cardinalities of y's evidences
    priors: the prior probabilities of y's evidences

Returns a python float variable as the weight

**get_cards_permutation**(cards)

Returns a permutation for the cardinalities of evidences. For example, given the cardinality list `[2, 1, 4]`, the following list of tuples will be returned:

```
[(0, 0, 0), (1, 0, 0), (0, 0, 1), (1, 0, 1), (0, 0, 2), (1, 0, 2), (0, 0, 3), (1, 0, 3), (0, 0, 4), (1, 0, 4), (0, 0, 5), (1, 0, 5)]
```
