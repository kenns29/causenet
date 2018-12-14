import dagre from 'dagre';
import {array2Object} from './base';
import {
  clipLine,
  getLineLength,
  getPointOnPerpendicularBisector
} from './transform';

export const createNodeMap = network =>
  network.reduce((map, {source, target}) => {
    return [source, target].reduce(
      (m, label) =>
        m.hasOwnProperty(label) ? m : Object.assign(m, {[label]: {label}}),
      map
    );
  }, {});

/**
 * Obtain the Bayesian Network in a direct acyclic graph (DAG) layout using
 * the Dagre JavaScript library <https://github.com/dagrejs/dagre>
 */
export const createDagLayout = ({nodes, links}, graphAttributes) => {
  const dag = new dagre.graphlib.Graph();
  dag.setGraph(
    {rankdir: 'LR', ranker: 'tight-tree'},
    ...(graphAttributes || {})
  );
  dag.setDefaultEdgeLabel(() => {});
  nodes.forEach(node => {
    dag.setNode(node.label, {
      ...node,
      width: node.width + 10,
      height: node.height + 10
    });
  });
  links.forEach(({source, target, ...rest}) => {
    dag.setEdge(source.label, target.label, {...rest});
  });
  dagre.layout(dag);
  const layoutNodes = dag.nodes().map(v => Object.assign(dag.node(v)));
  const layoutEdges = dag.edges().map(e => {
    const edge = dag.edge(e);
    return {
      ...edge,
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
    targetMap[target] = {name: target, ...rest};
    map[source] = targetMap;
    return map;
  }, {});
  Object.keys(map).forEach(key => {
    map[key] = Object.values(map[key]);
  });
  return map;
};

export const linksToTargetAdjacencyMap = links => {
  const maps = links.reduce((map, {source, target, ...rest}) => {
    const sourceMap = map.hasOwnProperty(target) ? map[target] : {};
    sourceMap[source] = {name: source, ...rest};
    map[target] = sourceMap;
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

export const collapseLinks = links => {
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

  return sources.map(visit).reduce((links, targetMap, index) => {
    Object.entries(targetMap).forEach(([target, weight]) => {
      links.push({source: sources[index], target, weight});
    });
    return links;
  }, []);

  function visit(node) {
    const targetMap = {};
    adjMap[node].forEach(({name: neighbor, weight = 0}) => {
      const neighborTargetMap = nodeTargetsMap.hasOwnProperty(neighbor)
        ? nodeTargetsMap[neighbor]
        : visit(neighbor);
      Object.entries(neighborTargetMap).forEach(([target, tWeight]) => {
        targetMap[target] = weight + tWeight;
      });
      nodeTargetsMap[neighbor] = neighborTargetMap;
    });
    nodeTargetsMap[node] = targetMap;
    return targetMap;
  }
};
