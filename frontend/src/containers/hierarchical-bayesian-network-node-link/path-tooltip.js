import React, {PureComponent} from 'react';
import DeckGL, {
  OrthographicView,
  PolygonLayer,
  PathLayer,
  TextLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';

const ID = 'hierarchical-bayesian-network-node-link-path-tooltip';

const tooltipStyle = {
  position: 'absolute',
  zIndex: 9,
  pointerEvents: 'none',
  backgroundColor: 'white'
};

export default class PathTooltip extends PureComponent {
  _getPathLayout() {
    const textHeight = 150;
    const {path} = this.props;
    const [marginLeft, marginTop, marginBottom, marginRight] = [5, 5, 5, 80];
    const [nw, nh] = [10, 10];
    const l = 20;
    const nodes = path.map(({node}, index) => ({
      ...node,
      x: marginLeft + index * (nw + l) + nw / 2,
      y: marginTop + nh / 2 + textHeight,
      width: nw,
      height: nh
    }));
    const edges = path.slice(1).map(({weight}, index) => {
      const source = nodes[index];
      const target = nodes[index + 1];
      const {x: sx, y: sy, width: sw, height: sh} = source;
      const {x: tx, y: ty, width: tw, height: th} = target;
      const points = [
        [sx + sw / 2, sy],
        [(sx + tx) / 2 + (sw - tw) / 4, (sy + ty) / 2],
        [tx - tw / 2, ty]
      ];
      return {
        source,
        target,
        points,
        weight
      };
    });
    return {
      nodes,
      edges,
      width:
        marginLeft + nw + nodes[nodes.length - 1].x - nodes[0].x + marginRight,
      height: marginBottom + nh + marginTop + textHeight
    };
  }
  _renderNodes(nodes) {
    return [
      new PolygonLayer({
        id: ID + '-nodes-layer',
        data: nodes,
        getPolygon: ({x, y, width: w, height: h}) => [
          [x - w / 2, y - h / 2],
          [x + w / 2, y - h / 2],
          [x + w / 2, y + h / 2],
          [x - w / 2, y + h / 2],
          [x - w / 2, y - h / 2]
        ],
        getFillColor: () => [255, 255, 255, 255],
        getLineColor: () => [64, 64, 64, 255],
        getLineWidth: 2,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderEdges(edges) {
    return [
      new PathLayer({
        id: ID + '-path-layer',
        data: edges,
        getPath: ({points}) => points,
        getColor: [64, 64, 64, 255],
        getWidth: () => 2,
        pickable: true,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLabels(nodes) {
    return [
      new TextLayer({
        id: ID + '-label-layer',
        data: nodes,
        getText: d => d.label,
        getPosition: ({x, y, height: h}) => [x, y - h],
        getSize: 10,
        getAngle: 45,
        getTextAnchor: 'start',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers({nodes, edges}) {
    return [
      ...this._renderNodes(nodes),
      ...this._renderEdges(edges),
      ...this._renderLabels(nodes)
    ];
  }
  _renderBackgroundDiv({width, height}) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          position: 'absolute',
          width,
          height
        }}
      />
    );
  }
  render() {
    const {path, left, top} = this.props;
    const {nodes, edges, width, height} = this._getPathLayout();
    const views = [
      new OrthographicView({
        left: 0,
        right: width,
        bottom: height,
        top: 0,
        width,
        height
      })
    ];
    return (
      <div style={{...tooltipStyle, left, top}}>
        {this._renderBackgroundDiv({width, height})}
        <DeckGL
          width={width}
          height={height}
          views={views}
          layers={this._renderLayers({nodes, edges})}
        />
      </div>
    );
  }
}
