def edges_to_child_adjacency_dict(edges):
    child_dict = dict()
    for parent, child in edges:
        parent_set = child_dict[child] if child in child_dict else set()
        parent_set.add(parent)
    return child_dict
