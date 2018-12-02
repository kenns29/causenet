import {createSelector} from 'reselect';
import {createNodeMap} from '../../utils';
import {
  getRawClusterBayesianNetwork,
  getRawSubBayesianNetworkMap,
  getRawSubBayesianModelFeaturesMap
} from './raw';

export const getClusterBayesianModelFeatures = createSelector(
  getRawSubBayesianNetworkMap,
  Object.keys
);

export const getClusterBayesianModelFeaturesInNetwork = createSelector(
  getRawClusterBayesianNetwork,
  edges => [
    ...edges.reduce((set, {source, target}) => {
      set.add(source);
      set.add(target);
      return set;
    }, new Set())
  ]
);

export const getSubBayesianModelFeaturesMapInNetwork = createSelector(
  [getRawSubBayesianModelFeaturesMap, getClusterBayesianModelFeaturesInNetwork],
  (clusterMap, features) =>
    features.reduce(
      (map, feature) => Object.assign(map, {[feature]: clusterMap[feature]}),
      {}
    )
);

export const getClusterBayesianNetworkNodeLink = createSelector(
  [getRawClusterBayesianNetwork, getSubBayesianModelFeaturesMapInNetwork],
  (edges, clusterMap) => {
    const nodeMap = createNodeMap(edges);
  }
);
