import {createSelector} from 'reselect';
import {createNodeMap, createDagLayout} from '../../utils';
import {
  getRawClusterBayesianNetwork,
  getRawClusterBayesianModelFeatures,
  getRawSubBayesianNetworkMap,
  getRawSubBayesianModelFeaturesMap
} from './raw';

export const getClusterBayesianModelFeaturesInNetwork = createSelector(
  getRawClusterBayesianNetwork,
  rawLinks => [
    ...rawLinks.reduce((set, {source, target}) => {
      set.add(source);
      set.add(target);
      return set;
    }, new Set())
  ]
);

export const getSubBayesianModelFeaturesMap = createSelector(
  [getRawSubBayesianModelFeaturesMap, getRawClusterBayesianModelFeatures],
  (rawSubBayesianModelFeaturesMap, clusterFeatures) =>
    clusterFeatures.reduce(
      (map, feature) =>
        Object.assign(map, {
          [feature]: rawSubBayesianModelFeaturesMap.hasOwnProperty(feature)
            ? rawSubBayesianModelFeaturesMap[feature]
            : [feature]
        }),
      {}
    )
);

export const getSubBayesianModelFeaturesMapInNetwork = createSelector(
  [getSubBayesianModelFeaturesMap, getClusterBayesianModelFeaturesInNetwork],
  (clusterMap, features) =>
    features.reduce(
      (map, feature) =>
        clusterMap.hasOwnProperty(feature)
          ? Object.assign(map, {[feature]: clusterMap[feature]})
          : map,
      {}
    )
);

export const getClusterBayesianNetworkNodeLink = createSelector(
  [getRawClusterBayesianNetwork, getSubBayesianModelFeaturesMapInNetwork],
  (rawLinks, clusterMap) => {
    const nodeMap = Object.entries(createNodeMap(rawLinks)).reduce(
      (map, [label, values]) =>
        clusterMap.hasOwnProperty(label)
          ? Object.assign(map, {
            [label]: Object.assign(values, {cluster: clusterMap[label]})
          })
          : map,
      {}
    );
    const nodes = Object.values(nodeMap);
    const links = rawLinks
      .filter(
        ({source, target}) =>
          ![source, target].some(node => !nodeMap.hasOwnProperty(node))
      )
      .map(({source, target, weight}) => ({
        source: nodeMap[source],
        target: nodeMap[target],
        weight
      }));
    return {nodes, links};
  }
);

export const getClusterBayesianNetworkNodeLinkLayoutData = createSelector(
  getClusterBayesianNetworkNodeLink,
  ({nodes, links}) => ({
    nodes: nodes.map(node =>
      Object.assign(node, {
        width: Math.log(node.cluster.length) * 20,
        height: Math.log(node.cluster.length) * 20
      })
    ),
    links
  })
);

export const getClusterBayesianNetworkNodeLinkLayout = createSelector(
  getClusterBayesianNetworkNodeLinkLayoutData,
  createDagLayout
);
