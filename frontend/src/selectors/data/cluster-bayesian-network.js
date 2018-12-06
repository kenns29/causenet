import {createSelector} from 'reselect';
import {createNodeMap, createDagLayout} from '../../utils';
import {
  getRawClusterBayesianNetwork,
  getRawClusterBayesianModelFeatures,
  getRawSubBayesianNetworkMap,
  getRawSubBayesianModelFeaturesMap
} from './raw';

export const getClusterBayesianModelFeatures = createSelector(
  getRawClusterBayesianNetwork,
  rawLinks => [
    ...rawLinks.reduce((set, {source, target}) => {
      set.add(source);
      set.add(target);
      return set;
    }, new Set())
  ]
);

export const getFullSubBayesianModelFeaturesMap = createSelector(
  [getRawSubBayesianModelFeaturesMap, getRawClusterBayesianModelFeatures],
  (rawSubBayesianModelFeaturesMap, clusterFeatures) =>
    clusterFeatures.reduce(
      (map, feature) =>
        Object.assign(map, {
          [feature]: rawSubBayesianModelFeaturesMap[feature]
        }),
      {}
    )
);

export const getSubBayesianModelFeaturesMap = createSelector(
  [getFullSubBayesianModelFeaturesMap, getClusterBayesianModelFeatures],
  (clusterMap, features) =>
    Object.keys(clusterMap).length
      ? features.reduce(
        (map, feature) =>
          Object.assign(map, {[feature]: clusterMap[feature]}),
        {}
      )
      : {}
);

export const getClusterBayesianNetworkNodeLink = createSelector(
  [getRawClusterBayesianNetwork, getSubBayesianModelFeaturesMap],
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

export const getFullSubBayesianNetworkNodeLinkMap = createSelector(
  getRawSubBayesianNetworkMap,
  rawSubBayesianNetworkMap =>
    Object.entries(rawSubBayesianNetworkMap).reduce((map, [key, rawLinks]) => {
      const nodeMap = createNodeMap(rawLinks);
      const nodes = Object.values(nodes);
      const links = rawLinks.map(({source, target, weight}) => ({
        source: nodeMap[source],
        target: nodeMap[target],
        weight
      }));
      return Object.assign(map, {[key]: {nodes, links}});
    }, {})
);

export const getSubBayesianNetworkMap = createSelector(
  [getRawSubBayesianNetworkMap, getClusterBayesianModelFeatures],
  (rawLinkMap, clusterFeatures) =>
    clusterFeatures.reduce(
      (map, feature) =>
        rawLinkMap.hasOwnProperty(feature)
          ? Object.assign(map, {[feature]: rawLinkMap[feature]})
          : map,
      {}
    )
);

export const getSubBayesianNetworkNodeLinkMap = createSelector(
  getSubBayesianNetworkMap,
  subBayesianNetworkMap =>
    Object.entries(subBayesianNetworkMap).reduce((map, [key, rawLinks]) => {
      const nodeMap = createNodeMap(rawLinks);
      const nodes = Object.values(nodeMap);
      const links = rawLinks.map(({source, target, weight}) => ({
        source: nodeMap[source],
        target: nodeMap[target],
        weight
      }));
      return Object.assign(map, {[key]: {nodes, links}});
    }, {})
);

export const getSubBayesianNetworkLayoutDataMap = createSelector(
  getSubBayesianNetworkNodeLinkMap,
  nodeLinkMap =>
    Object.entries(nodeLinkMap).reduce(
      (map, [key, {nodes, links}]) =>
        Object.assign(map, {
          [key]: {
            nodes: nodes.map(node =>
              Object.assign(node, {
                width: 2,
                height: 2
              })
            ),
            links
          }
        }),
      {}
    )
);

export const getSubBayesianNetworkNodeLinkLayoutMap = createSelector(
  getSubBayesianNetworkLayoutDataMap,
  layoutDataMap =>
    Object.entries(layoutDataMap).reduce(
      (map, [key, nodeLink]) =>
        Object.assign(map, {
          [key]: createDagLayout(nodeLink, {
            nodesep: 10,
            edgesep: 5,
            ranksep: 10
          })
        }),
      {}
    )
);

export const getClusterBayesianNetworkNodeLinkLayoutData = createSelector(
  [getClusterBayesianNetworkNodeLink, getSubBayesianNetworkNodeLinkLayoutMap],
  ({nodes, links}, subNetworkLayoutMap) => ({
    nodes: nodes.map(node =>
      Object.assign(
        node,
        subNetworkLayoutMap.hasOwnProperty(node.label)
          ? {
            width: subNetworkLayoutMap[node.label].width,
            height: subNetworkLayoutMap[node.label].height
          }
          : {width: 10, height: 10}
      )
    ),
    links
  })
);

export const getClusterBayesianNetworkNodeLinkLayout = createSelector(
  getClusterBayesianNetworkNodeLinkLayoutData,
  createDagLayout
);
