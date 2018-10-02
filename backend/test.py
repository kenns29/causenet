import numpy as np
from bn_edge_weights import helloworld, test


def normalize_clustering_dist(clustering):
    max_dist = clustering[-1][2]
    return np.array([[n1, n2, n_dist / max_dist, num] for n1, n2, n_dist, num in clustering])


if __name__ == '__main__':
    print(test('df'))
    print('---')
