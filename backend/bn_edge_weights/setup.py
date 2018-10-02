from distutils.core import setup, Extension

bn_edge_weights = Extension('bn_edge_weights', sources=['bn_edge_weights.c'])

setup(name='bn_edge_weights',
      version='1.0',
      description='Compute edge weights of a BN model using mutual information',
      ext_modules=[bn_edge_weights])
