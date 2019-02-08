import dagre from 'dagre';
import {array2Object, makeAccessor} from './base';
import {
  clipLine,
  getLineLength,
  getPointOnPerpendicularBisector
} from './transform';

export const linksToNodeMap = (network, getId = d => d, getLabel = d => d) =>
  network.reduce(
    (map, {source, target}) =>
      [source, target].reduce((m, node) => {
        const [id, label] = [getId(node), getLabel(node)];
        return m.hasOwnProperty(id) ? m : Object.assign(m, {[id]: {id, label}});
      }, map),
    {}
  );

/**
 * Update the node links without modifying the original node links,
 * returns a new node link object in which the reference across nodes and links
 * is preserved.
 * @param {Object} nodeLinks -- the node link object,
 * @param {Function|String} k -- key used to match nodes, default is 'label'
 * @param {Function} n -- optional: returns a new node with the update, if not
 *                        not specified, returns a new node without update
 * @param {Function} e -- optional: returns a new link with the update, if not
 *                        not specified, returns a new link without update
 * @return {Object} nodeLinks
 */
export const createUpdatedNodeLink = ({
  nodeLink = {nodes: [], links: []},
  n = d => ({...d}),
  e = d => d,
  k = 'label',
  nodesName = 'nodes',
  linksName = 'links'
}) => {
  const {[nodesName]: nodes, [linksName]: links} = nodeLink;
  const newNodes = nodes.map(n);
  const newNodeMap = array2Object(newNodes, k);
  const ka = makeAccessor(k);

  const newLinks = links.map(link => {
    const newLink = e(link);
    const {source, target} = link;
    return {
      ...newLink,
      source: newNodeMap[ka(source)],
      target: newNodeMap[ka(target)]
    };
  });
  return {...nodeLink, [nodesName]: newNodes, [linksName]: newLinks};
};

/**
 * Obtain the Bayesian Network in a direct acyclic graph (DAG) layout using
 * the Dagre JavaScript library <https://github.com/dagrejs/dagre>
 */
export const createDagLayout = (
  {nodes, links},
  graphAttributes,
  nodeId = d => d.label
) => {
  const dag = new dagre.graphlib.Graph();
  dag.setGraph(
    {rankdir: 'LR', ranker: 'tight-tree'},
    ...(graphAttributes || {})
  );
  dag.setDefaultEdgeLabel(() => {});
  nodes.forEach(node => {
    dag.setNode(nodeId(node), {
      ...node,
      data: node,
      width: node.width + 10,
      height: node.height + 10
    });
  });
  links.forEach(({source, target, ...rest}) => {
    dag.setEdge(nodeId(source), nodeId(target), {...rest});
  });
  dagre.layout(dag);
  const layoutNodes = dag.nodes().map(v => dag.node(v));
  const layoutEdges = dag.edges().map(e => {
    const edge = dag.edge(e);
    return {
      ...edge,
      data: edge,
      sourceId: e.v,
      targetId: e.w,
      source: dag.node(e.v),
      target: dag.node(e.w),
      points: edge.points.map(({x, y}) => [x, y, 0])
    };
  });
  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    width: dag.graph().width,
    height: dag.graph().height
  };
};

export const createTemporalDagLayout = (
  {nodes, links},
  features // list of all available features according to the clustering
) => {
  let [minYear, maxYear] = [Infinity, -Infinity];
  // group nodes based on the base feature
  const nodeGroups = nodes.reduce((groups, node) => {
    const [baseFeature, yearStr] = node.label.split('~');
    const year = Number(yearStr);

    // update min max year
    minYear = Math.min(year, minYear);
    maxYear = Math.max(year, maxYear);

    if (!groups.hasOwnProperty(baseFeature)) {
      groups[baseFeature] = {};
    }
    groups[baseFeature][year] = node;
    return groups;
  }, {});
  const [width, height, hSpace, vSpace] = [20, 20, 40, 40];
  const layoutNodes = [].concat(
    ...features
      .filter(feature => nodeGroups.hasOwnProperty(feature))
      .map((feature, index) =>
        Object.entries(nodeGroups[feature]).map(([year, node]) => ({
          ...node,
          year,
          x: (width + hSpace) * (year - minYear) + width / 2,
          y: (height + vSpace) * index + height / 2,
          width,
          height
        }))
      )
  );
  const layoutNodeMap = array2Object(layoutNodes, d => d.label);
  const layoutEdges = links.map(
    ({source: {label: sourceId}, target: {label: targetId}, ...rest}) => {
      const [source, target] = [sourceId, targetId].map(
        id => layoutNodeMap[id]
      );
      const [sourceTime, targetTime] = [sourceId, targetId].map(id =>
        Number(id.split('~')[1])
      );
      const [[sx, sy], [tx, ty]] = clipLine({
        line: [source, target].map(({x, y}) => [x, y, 0]),
        clipLengths: [10, 10]
      });
      const [mx, my] = getPointOnPerpendicularBisector({
        line: [[sx, sy, 0], [tx, ty, 0]],
        distance: getLineLength({line: [[sx, sy, 0], [tx, ty, 0]]}) / 4
      });

      return {
        ...rest,
        sourceId,
        targetId,
        source,
        target,
        points: [[sx, sy, 0], [mx, my, 0], [tx, ty, 0]],
        isBackward: sourceTime > targetTime
      };
    }
  );
  return {nodes: layoutNodes, edges: layoutEdges};
};

export const createBayesianNetworkNodeLinkLayout = (
  nodeLink,
  features,
  isTemporal
) =>
  isTemporal
    ? createTemporalDagLayout(nodeLink, features)
    : createDagLayout(nodeLink);

export const linksToSourceAdjacencyMap = links => {
  const map = links.reduce((map, {source, target, ...rest}) => {
    const targetMap = map.hasOwnProperty(source) ? map[source] : {};
    targetMap[target] = {id: target, ...rest};
    map[source] = targetMap;
    if (!map.hasOwnProperty(target)) {
      map[target] = {};
    }
    return map;
  }, {});
  Object.keys(map).forEach(key => {
    map[key] = Object.values(map[key]);
  });
  return map;
};

export const linksToTargetAdjacencyMap = links => {
  const map = links.reduce((map, {source, target, ...rest}) => {
    const sourceMap = map.hasOwnProperty(target) ? map[target] : {};
    sourceMap[source] = {id: source, ...rest};
    map[target] = sourceMap;
    if (!map.hasOwnProperty(source)) {
      map[source] = {};
    }
    return map;
  }, {});
  Object.keys(map).forEach(key => {
    map[key] = Object.values(map[key]);
  });
  return map;
};

export const linksToDegreeMap = links =>
  links.reduce((map, {source, target}) => {
    if (!map.hasOwnProperty(source)) {
      map[source] = {inDeg: 0, outDeg: 0};
    }
    if (!map.hasOwnProperty(target)) {
      map[target] = {inDeg: 0, outDeg: 0};
    }
    ++map[source].outDeg;
    ++map[target].inDeg;
    return map;
  }, {});

export const linksToAbstractLinks = links => {
  const degreeMap = linksToDegreeMap(links);
  const [sources, targets] = Object.entries(degreeMap).reduce(
    ([sources, targets], [node, {inDeg, outDeg}]) => {
      if (inDeg === 0) {
        sources.push(node);
      } else if (outDeg === 0) {
        targets.push(node);
      }
      return [sources, targets];
    },
    [[], []]
  );
  const adjMap = linksToSourceAdjacencyMap(links);
  const nodeTargetsMap = {};

  const numSources = sources.length;
  let targetIndex = 0;
  return sources.map(visit).reduce((links, targets, sourceIndex) => {
    targets.forEach(({name, weight, path}) => {
      links.push({
        source: {id: sourceIndex, name: sources[sourceIndex]},
        target: {id: numSources + targetIndex++, name},
        weight: weight / path.length / path.length,
        path
      });
    });
    return links;
  }, []);

  function visit(node) {
    const targets = [];
    const neighbors = adjMap[node];
    if (!neighbors.length) {
      targets.push({id: node, name: node, weight: 0, path: []});
    } else {
      neighbors.forEach(({id: neighbor, name, weight = 0}) => {
        const neighborTargets = nodeTargetsMap.hasOwnProperty(neighbor)
          ? nodeTargetsMap[neighbor]
          : visit(neighbor);
        neighborTargets.forEach(({id, name, weight: targetWeight, path}) => {
          targets.push({
            id,
            name,
            weight: weight + targetWeight,
            path: [{name: neighbor, weight}, ...path]
          });
        });
        nodeTargetsMap[neighbor] = neighborTargets;
      });
    }
    nodeTargetsMap[node] = targets;
    return targets;
  }
};

export const abstractLinksToReducedAbstractLinks = (
  abstractLinks,
  slice = [0, 10]
) =>
  abstractLinks
    .slice(0)
    .sort((a, b) => a.weight - b.weight)
    .slice(...slice);

export const getPathLinksFromNode = (id, sourceAdjacencyMap) => {
  const links = [];
  if (!sourceAdjacencyMap.hasOwnProperty(id)) {
    return links;
  }
  const stack = [id];
  const visited = new Set();
  while (stack.length) {
    const source = stack.pop();
    visited.add(source);
    sourceAdjacencyMap[source].forEach(({id: target, ...rest}) => {
      links.push({source, target, ...rest});
      if (!visited.has(target)) {
        stack.push(target);
      }
    });
  }
  return links;
};

export const getPathLinksToNode = (id, targetAdjacencyMap) => {
  const links = [];
  if (!targetAdjacencyMap.hasOwnProperty(id)) {
    return links;
  }
  const stack = [id];
  const visited = new Set();
  while (stack.length) {
    const target = stack.pop();
    visited.add(target);
    targetAdjacencyMap[target].forEach(({id: source, ...rest}) => {
      links.push({source, target, ...rest});
      if (!visited.has(source)) {
        stack.push(source);
      }
    });
  }
  return links;
};

export const getPathLinksThroughNode = (
  id,
  sourceAdjacencyMap,
  targetAdjacencyMap
) => [
  ...getPathLinksFromNode(id, sourceAdjacencyMap),
  ...getPathLinksToNode(id, targetAdjacencyMap)
];

export const getPathLinksBetweenNodes = ([id1, id2], sourceAdjacencyMap) => {
  const links = [];
  visit(id1, new Set([id2]));
  return links;

  function visit(source, nodeSet) {
    const targets = sourceAdjacencyMap[source];
    if (!targets) {
      return false;
    }
    if (nodeSet.has(source)) {
      return true;
    }
    let keepEdge = false;
    targets.forEach(({id: target, ...rest}) => {
      const keepTarget = visit(target, nodeSet);
      if (keepTarget) {
        keepEdge = true;
        links.push({source, target, ...rest});
        nodeSet.add(target);
      }
    });
    return keepEdge;
  }
};
