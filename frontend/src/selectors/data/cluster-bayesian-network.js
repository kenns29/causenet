import {createSelector} from 'reselect';
import {
  linksToNodeMap,
  createDagLayout,
  array2Object,
  linksToAbstractLinks,
  createUpdatedNodeLink
} from '../../utils';
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

export const getAbstractSubBayesianNetworkNodeMapMap = createSelector(
  getAbstractSubBayesianNetworkMap,
  abstractLinkMap =>
    Object.entries(abstractLinkMap).reduce(
      (map, [key, links]) =>
        Object.assign(map, {
          [key]: linksToNodeMap(links, d => d.id, d => d.name)
        }),
      {}
    )
);

export const getAbstractSubBayesianNetworkNodeLinkMap = createSelector(
  [
    getAbstractSubBayesianNetworkMap,
    getAbstractSubBayesianNetworkNodeMapMap,
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

export const getAbstractSubBayesianNetworkNodeLinkLayoutDataMap = createSelector(
  getAbstractSubBayesianNetworkNodeLinkMap,
  abstractNodeLinkMap =>
    Object.entries(abstractNodeLinkMap).reduce(
      (map, [key, abstractNodeLink]) =>
        Object.assign(map, {
          [key]: createUpdatedNodeLink(
            abstractNodeLink,
            node => ({
              ...node,
              width: 2,
              height: 2
            }),
            link => link,
            'id'
          )
        }),
      {}
    )
);

export const getAbstractSubBayesianNetworkNodeLinkLayoutMap = createSelector(
  getAbstractSubBayesianNetworkNodeLinkLayoutDataMap,
  abstractLayoutDataMap =>
    Object.entries(abstractLayoutDataMap).reduce(
      (map, [key, abstractLayoutData]) =>
        Object.assign(map, {
          [key]: createDagLayout(abstractLayoutData, {
            nodesep: 10,
            edgesep: 5,
            ranksep: 10
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
          [key]: createUpdatedNodeLink(nodeLink, node => ({
            ...node,
            width: 2,
            height: 2
          }))
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
    getAbstractSubBayesianNetworkNodeLinkLayoutMap
  ],
  (nodeLink, subNetworkLayoutMap) =>
    createUpdatedNodeLink(nodeLink, node => ({
      ...node,
      ...(subNetworkLayoutMap.hasOwnProperty(node.label)
        ? {
          width: subNetworkLayoutMap[node.label].width,
          height: subNetworkLayoutMap[node.label].height
        }
        : {width: 10, height: 10})
    }))
);

export const getClusterBayesianNetworkNodeLinkLayout = createSelector(
  getClusterBayesianNetworkNodeLinkLayoutData,
  createDagLayout
);

export const getShiftedAbstractSubBayesianNetworkNodeLinkLayoutMap = createSelector(
  [
    getAbstractSubBayesianNetworkNodeLinkLayoutMap,
    getClusterBayesianNetworkNodeLinkLayout
  ],
  (subNetworkLayoutMap, {nodes: clusterNodes}) => {
    const clusterNodeMap = array2Object(clusterNodes, d => d.label);
    return Object.entries(subNetworkLayoutMap).reduce(
      (map, [clusterId, layout]) => {
        const {x: cx, y: cy, width: cw, height: ch} = clusterNodeMap[clusterId];
        return Object.assign(map, {
          [clusterId]: createUpdatedNodeLink(
            layout,
            node => ({
              ...node,
              x: node.x + cx - cw / 2,
              y: node.y + cy - ch / 2
            }),
            ({points, ...rest}) => ({
              points: points.map(([x, y, z]) => [
                x + cx - cw / 2,
                y + cy - ch / 2,
                z
              ])
            }),
            'id',
            'nodes',
            'edges'
          )
        });
      },
      {}
    );
  }
);

export const getShiftedAbstractSubBayesianNetworkNodeLinkLayouts = createSelector(
  getShiftedAbstractSubBayesianNetworkNodeLinkLayoutMap,
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
          [clusterId]: createUpdatedNodeLink(
            layout,
            node => ({
              ...node,
              x: node.x + cx - cw / 2,
              y: node.y + cy - ch / 2
            }),
            ({points, ...rest}) => ({
              points: points.map(([x, y, z]) => [
                x + cx - cw / 2,
                y + cy - ch / 2,
                z
              ])
            }),
            'label',
            'nodes',
            'edges'
          )
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
