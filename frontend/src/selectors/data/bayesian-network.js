import {createSelector} from 'reselect';
import {createNodeMap, createBayesianNetworkNodeLinkLayout} from '../../utils';
import {
  getRawBayesianNetwork,
  getRawModifiedBayesianNetwork,
  getRawBayesianModelFeatures,
  getRawFeatureValuesMap,
  getRawBayesianModelFeatureValueSelectionMap
} from './raw';

export const getIsTemporalBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  rawBayesianNetwork =>
    !rawBayesianNetwork.some(
      ({source, target}) => !source.includes('~') || !target.includes('~')
    )
);

export const getBayesianModelFeatures = createSelector(
  [getRawBayesianModelFeatures, getRawFeatureValuesMap],
  (features, featureValuesMap) =>
    features.map(feature => ({
      feature,
      values: featureValuesMap[feature]
    }))
);

/**
 * Obtain a map (label -> Node) in the Bayesian network
 * @param {Array} rawBayesianNetwork
 * @return {Object} the map
 */
export const getNodeMap = createSelector(getRawBayesianNetwork, createNodeMap);

/**
 * Obtain a map (label -> Node) in the modified Bayesian network
 * @param {Array} rawModifiedBayesianNetwork
 * @return {Object} the map
 */
export const getModifiedNodeMap = createSelector(
  getRawModifiedBayesianNetwork,
  createNodeMap
);

/**
 * Obtain a map ('sourceId-targetId' -> link) in the modified Bayesian network
 */
export const getModifiedLinkMap = createSelector(
  getRawModifiedBayesianNetwork,
  data =>
    data.reduce(
      (map, link) =>
        Object.assign(map, {[link.source + '-' + link.target]: link}),
      {}
    )
);

/**
 * Obtain the node-link data for the Bayesian Network
 */
export const getBayesianNetworkNodeLink = createSelector(
  [
    getRawBayesianNetwork,
    getModifiedLinkMap,
    getNodeMap,
    getModifiedNodeMap,
    getRawBayesianModelFeatureValueSelectionMap
  ],
  (
    rawLinks,
    modifiedLinkMap,
    nodeMap,
    modifiedNodeMap,
    featureValueSelectionMap
  ) => {
    const newNodeMap = Object.entries(nodeMap).reduce(
      (map, [key, node]) =>
        Object.assign(map, {
          [key]: {
            ...node,
            isModified: featureValueSelectionMap.hasOwnProperty(node.label),
            isRemoved: !modifiedNodeMap.hasOwnProperty(node.label)
          }
        }),
      {}
    );
    const nodes = Object.values(newNodeMap);
    const links = rawLinks.map(({source, target, weight}) => ({
      source: newNodeMap[source],
      target: newNodeMap[target],
      weight,
      isRemoved: !modifiedLinkMap.hasOwnProperty(source + '-' + target)
    }));
    return {nodes, links};
  }
);

export const getBayesianNetworkNodeLinkLayoutData = createSelector(
  getBayesianNetworkNodeLink,
  ({nodes, links}) => ({
    nodes: nodes.map(node => ({...node, width: 20, height: 20})),
    links
  })
);
