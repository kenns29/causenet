import {createSelector} from 'reselect';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';
import {
  getSelectedSubBayesianNetworkId,
  getRawSubBayesianNetworkMap
} from './raw';
import {
  linksToNodeMap,
  createUpdatedNodeLink,
  createDagLayout
} from '../../utils';

export const getSelectedSubBayesianNetwork = createSelector(
  [getSelectedSubBayesianNetworkId, getRawSubBayesianNetworkMap],
  (id, map) => (id === null || id === undefined ? [] : map[id])
);

export const getSelectedSubBayesianNetworkNodeLink = createSelector(
  getSelectedSubBayesianNetwork,
  rawLinks => {
    const nodeMap = linksToNodeMap(rawLinks);
    const nodes = Object.values(nodeMap);
    const links = rawLinks.map(({source, target, ...rest}) => ({
      ...rest,
      source: nodeMap[source],
      target: nodeMap[target]
    }));
    return {nodes, links};
  }
);

export const getSelectedSubBayesianNetworkNodeLinkLayoutData = createSelector(
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

export const getSelectedSubBayesianNetworkNodeLinkLayout = createSelector(
  getSelectedSubBayesianNetworkNodeLinkLayoutData,
  layoutData => {
    const layout = createDagLayout(layoutData);
    const {edges} = layout;
    const mw = edges.reduce((max, {weight: w}) => Math.max(max, w), 0);
    const scale = scaleLinear()
      .domain([0, mw])
      .range([0, 5]);
    edges.forEach(edge => {
      const {r, g, b} = rgb(edge.corr > 0 ? 'lightblue' : 'red');
      edge.color = [r, g, b];
      edge.width = scale(edge.weight);
    });
    return layout;
  }
);
