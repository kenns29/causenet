from modules.service.edge_weights import get_edge_weights
from modules.service.model_utils import get_model

model = get_model('qcut5.bin')

weighted_edges = get_edge_weights(model)

print(weighted_edges)
