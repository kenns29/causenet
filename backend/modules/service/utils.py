def edges_to_child_adjacency_dict(edges, col2index=None):
    c_dict = dict()
    for parent, child in edges:
        p, c = (col2index[parent], col2index[child]) if col2index else (parent, child)
        p_set = c_dict[c] if c in c_dict else set()
        p_set.add(p)
        c_dict[c] = p_set
    return c_dict


def child_index_adjacency_dict_to_list(child_dict, n):
    """
    create a child adjacency list with the child adjacency dict

    :param child_dict: the child adjacency dict in which each key and elements are integers
    :param n: the total number children
    :return: A 2D adjacency list
    """
    return [sorted(child_dict[i]) if i in child_dict else [] for i in range(n)]


def edges_to_child_index_adjacency_list(edges, n, col2index=None):
    return child_index_adjacency_dict_to_list(edges_to_child_adjacency_dict(edges, col2index), n)
