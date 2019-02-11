import React, {PureComponent} from 'react';
import {PolygonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {SplineLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';

const ID = 'bayesian-network-sub-network-detail';

export default class ContentPanel extends PureComponent {
  _renderNodes() {
    const {
      nodeLink: {nodes}
    } = this.props;
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
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pickable: true
      })
    ];
  }
  _renderEdges() {
    const {
      nodeLink: {edges}
    } = this.props;
    const pathProps = {
      id: ID + '-path-layer',
      data: edges,
      getSourcePosition: ({points}) => points[0].slice(0, 2),
      getTargetPosition: ({points}) => points[points.length - 1].slice(0, 2),
      getControlPoints: ({points}) =>
        points.slice(1, points.length - 1).map(d => d.slice(0, 2)),
      getColor: d => d.color,
      getStrokeWidth: d => d.width,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      pickable: true
    };
    return [new SplineLayer(pathProps)];
  }
  _renderLayers() {
    return [...this._renderNodes(), ...this._renderEdges()];
  }
  render() {
    const {width, height} = this.props;
    return (
      <ZoomableContainer
        width={width}
        height={height}
        left={0}
        right={width}
        bottom={height}
        top={0}
        layers={this._renderLayers()}
      />
    );
  }
}
