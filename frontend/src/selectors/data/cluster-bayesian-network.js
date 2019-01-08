import {createSelector} from 'reselect';
import {scaleDiverging, scaleLinear} from 'd3-scale';
import {interpolateRdBu} from 'd3-scale-chromatic';
import {rgb, color as d3Color} from 'd3-color';
import {
  linksToNodeMap,
  createDagLayout,
  array2Object,
  linksToAbstractLinks,
  abstractLinksToReducedAbstractLinks,
  createUpdatedNodeLink
} from '../../utils';
import {
  getRawClusterBayesianNetwork,
  getRawClusterBayesianModelFeatures,
  getRawSubBayesianNetworkMap,
  getRawSubBayesianModelFeaturesMap,
  getRawSubBayesianNetworkSliceMap
} from './raw';
import {getId2DistanceFunction} from './hierarchical-clustering';

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
  [
    getRawClusterBayesianNetwork,
    getSubBayesianModelFeaturesMap,
    getId2DistanceFunction
  ],
  (rawLinks, clusterMap, id2Distance) => {
    const nodeMap = Object.entries(linksToNodeMap(rawLinks)).reduce(
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
      .map(({source, target, ...rest}) => {
        return {
          ...rest,
          source: nodeMap[source],
          target: nodeMap[target]
        };
      });
    return {nodes, links};
  }
);

export const getFullSubBayesianNetworkNodeLinkMap = createSelector(
  getRawSubBayesianNetworkMap,
  rawSubBayesianNetworkMap =>
    Object.entries(rawSubBayesianNetworkMap).reduce((map, [key, rawLinks]) => {
      const nodeMap = linksToNodeMap(rawLinks);
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

export const getSubBayesianNetworkNodeMapMap = createSelector(
  getSubBayesianNetworkMap,
  rawLinkMap =>
    Object.entries(rawLinkMap).reduce(
      (map, [key, links]) => Object.assign(map, {[key]: linksToNodeMap(links)}),
      {}
    )
);

export const getAbstractSubBayesianNetworkMap = createSelector(
  getSubBayesianNetworkMap,
  rawLinkMap =>
    Object.entries(rawLinkMap).reduce(
      (map, [key, links]) =>
        Object.assign(map, {[key]: linksToAbstractLinks(links)}),
      {}
    )
);

export const getReducedAbstractSubBayesianNetworkMap = createSelector(
  [getAbstractSubBayesianNetworkMap, getRawSubBayesianNetworkSliceMap],
  (abstractSubBayesianNetworkMap, subBayesianNetworkSliceMap) =>
    Object.entries(abstractSubBayesianNetworkMap).reduce(
      (map, [key, abstractLinks]) =>
        Object.assign(map, {
          [key]: abstractLinksToReducedAbstractLinks(
            abstractLinks,
            subBayesianNetworkSliceMap[key]
          )
        }),
      {}
    )
);

export const getReducedAbstractSubBayesianNetworkNodeMapMap = createSelector(
  getReducedAbstractSubBayesianNetworkMap,
  abstractLinkMap =>
    Object.entries(abstractLinkMap).reduce(
      (map, [key, links]) =>
        Object.assign(map, {
          [key]: linksToNodeMap(links, d => d.id, d => d.name)
        }),
      {}
    )
);

export const getReducedAbstractSubBayesianNetworkNodeLinkMap = createSelector(
  [
    getReducedAbstractSubBayesianNetworkMap,
    getReducedAbstractSubBayesianNetworkNodeMapMap,
    getSubBayesianNetworkNodeMapMap
  ],
  (abstractLinksMap, abstractNodeMapMap, nodeMapMap) =>
    Object.entries(abstractLinksMap).reduce((map, [key, abstractLinks]) => {
      const nodeMap = nodeMapMap[key];
      const abstractNodeMap = abstractNodeMapMap[key];
      const nodes = Object.values(abstractNodeMap);
      const links = abstractLinks.map(({source, target, path, ...rest}) => ({
        ...rest,
        source: abstractNodeMap[source.id],
        target: abstractNodeMap[target.id],
        path: path.map(({name, weight}) => ({node: nodeMap[name], weight}))
      }));
      return Object.assign(map, {[key]: {nodes, links}});
    }, {})
);

export const getReducedAbstractSubBayesianNetworkNodeLinkLayoutDataMap = createSelector(
  getReducedAbstractSubBayesianNetworkNodeLinkMap,
  abstractNodeLinkMap =>
    Object.entries(abstractNodeLinkMap).reduce(
      (map, [key, abstractNodeLink]) =>
        Object.assign(map, {
          [key]: createUpdatedNodeLink({
            nodeLink: abstractNodeLink,
            n: node => ({
              ...node,
              width: 2,
              height: 2
            }),
            k: 'id'
          })
        }),
      {}
    )
);

export const getReducedAbstractSubBayesianNetworkNodeLinkLayoutMap = createSelector(
  getReducedAbstractSubBayesianNetworkNodeLinkLayoutDataMap,
  abstractLayoutDataMap =>
    Object.entries(abstractLayoutDataMap).reduce(
      (map, [key, abstractLayoutData]) =>
        Object.assign(map, {
          [key]: createDagLayout(abstractLayoutData, {
            nodesep: 5,
            edgesep: 2.5,
            ranksep: 5
          })
        }),
      {}
    )
);

export const getSubBayesianNetworkNodeLinkMap = createSelector(
  getSubBayesianNetworkMap,
  subBayesianNetworkMap =>
    Object.entries(subBayesianNetworkMap).reduce((map, [key, rawLinks]) => {
      const nodeMap = linksToNodeMap(rawLinks);
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
      (map, [key, nodeLink]) =>
        Object.assign(map, {
          [key]: createUpdatedNodeLink({
            nodeLink,
            n: node => ({
              ...node,
              width: 2,
              height: 2
            })
          })
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
  [
    getClusterBayesianNetworkNodeLink,
    getReducedAbstractSubBayesianNetworkNodeLinkLayoutMap
  ],
  (nodeLink, subNetworkLayoutMap) =>
    createUpdatedNodeLink({
      nodeLink,
      n: node => ({
        ...node,
        ...(subNetworkLayoutMap.hasOwnProperty(node.label)
          ? {
            width: subNetworkLayoutMap[node.label].width,
            height: subNetworkLayoutMap[node.label].height
          }
          : {width: 10, height: 10})
      })
    })
);

export const getClusterBayesianNetworkNodeLinkLayout = createSelector(
  getClusterBayesianNetworkNodeLinkLayoutData,
  layoutData => {
    const layout = createDagLayout(layoutData);
    const {edges} = layout;
    const mw = edges.reduce(
      ({weight: w1}, {weight: w2}) => (w1 > w2 ? w1 : w2),
      0
    );
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

export const getShiftedReducedAbstractSubBayesianNetworkNodeLinkLayoutMap = createSelector(
  [
    getReducedAbstractSubBayesianNetworkNodeLinkLayoutMap,
    getClusterBayesianNetworkNodeLinkLayout
  ],
  (subNetworkLayoutMap, {nodes: clusterNodes}) => {
    const clusterNodeMap = array2Object(clusterNodes, d => d.label);
    return Object.entries(subNetworkLayoutMap).reduce(
      (map, [clusterId, layout]) => {
        const {x: cx, y: cy, width: cw, height: ch} = clusterNodeMap[clusterId];
        return Object.assign(map, {
          [clusterId]: createUpdatedNodeLink({
            nodeLink: layout,
            n: node => ({
              ...node,
              x: node.x + cx - cw / 2,
              y: node.y + cy - ch / 2
            }),
            e: ({points, ...rest}) => ({
              ...rest,
              points: points.map(([x, y, z]) => [
                x + cx - cw / 2,
                y + cy - ch / 2,
                z
              ])
            }),
            k: 'id',
            linksName: 'edges'
          })
        });
      },
      {}
    );
  }
);

export const getShiftedReducedAbstractSubBayesianNetworkNodeLinkLayouts = createSelector(
  getShiftedReducedAbstractSubBayesianNetworkNodeLinkLayoutMap,
  layoutMap =>
    Object.entries(layoutMap).map(([key, layout]) => ({...layout, key}))
);

export const getShiftedSubBayesianNetworkNodeLinkLayoutMap = createSelector(
  [
    getSubBayesianNetworkNodeLinkLayoutMap,
    getClusterBayesianNetworkNodeLinkLayout
  ],
  (subNetworkLayoutMap, {nodes: clusterNodes}) => {
    const clusterNodeMap = array2Object(clusterNodes, d => d.label);
    return Object.entries(subNetworkLayoutMap).reduce(
      (map, [clusterId, layout]) => {
        const {x: cx, y: cy, width: cw, height: ch} = clusterNodeMap[clusterId];
        return Object.assign(map, {
          [clusterId]: createUpdatedNodeLink({
            nodeLink: layout,
            n: node => ({
              ...node,
              x: node.x + cx - cw / 2,
              y: node.y + cy - ch / 2
            }),
            e: ({points, ...rest}) => ({
              ...rest,
              points: points.map(([x, y, z]) => [
                x + cx - cw / 2,
                y + cy - ch / 2,
                z
              ])
            }),
            k: 'label',
            linksName: 'edges'
          })
        });
      },
      {}
    );
  }
);

export const getShiftedSubBayesianNetworkNodeLinkLayouts = createSelector(
  getShiftedSubBayesianNetworkNodeLinkLayoutMap,
  layoutMap =>
    Object.entries(layoutMap).map(([key, layout]) => ({...layout, key}))
);
