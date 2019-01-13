import {createSelector} from 'reselect';
import {
  getSelectedSubBayesianNetworkId,
  getRawSubBayesianNetworkMap
} from './raw';
import {linksToNodeMap, createUpdatedNodeLink} from '../../utils';

export const getSelectedSubBayesianNetwork = createSelector(
  [getSelectedSubBayesianNetworkId, getRawSubBayesianNetworkMap],
  (id, map) => (id === null || id === undefined ? [] : map[id])
);

export const getSelectedSubBayesianNetworkNodeLink = createSelector(
  getSelectedSubBayesianNetwork,
  rawLinks => {
    const nodeMap = linksToNodeMap(rawLinks);
    const nodes = Object.values(nodes);
    const links = rawLinks.map(({source, target, weight}) => ({
      source: nodeMap[source],
      target: nodeMap[target],
      weight
    }));
    return [nodes, links];
  }
);

export const getSelectedSubBayesianNetworkLayoutData = createSelector(
  getSelectedSubBayesianNetworkNodeLink,
  nodeLink =>
    createUpdatedNodeLink({
      nodeLink,
      n: node => ({
        ...node,
        width: 2,
        height: 2
      }),
      k: 'id'
    })
);
