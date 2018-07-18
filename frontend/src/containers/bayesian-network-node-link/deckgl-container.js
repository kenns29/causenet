import React, {PureComponent} from 'react';
import {
  ScatterplotLayer,
  PathLayer,
  TextLayer,
  PolygonLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
import {makeLineArrow} from '../../utils';
const ID = 'bayesian-network-node-link';
export default class ContentPanel extends PureComponent {
  _renderNodes() {
    const {
      data: {nodes}
    } = this.props;
    return [
      new ScatterplotLayer({
        id: ID + '-scatterplot-layer',
        data: nodes,
        getPosition: ({x, y}) => [x, y],
        getRadius: ({width, height}) => Math.max(width, height) / 2,
        getColor: () => [64, 64, 64],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderEdges() {
    const {
      data: {edges}
    } = this.props;
    return [
      new PathLayer({
        id: ID + '-path-layer',
        data: edges,
        getPath: ({points}) => points.map(({x, y}) => [x, y]),
        getWidth: () => 1,
        getColor: () => [64, 64, 64],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderArrows() {
    const {
      data: {edges}
    } = this.props;
    return [
      new PolygonLayer({
        id: ID + '-arrow-layer',
        data: edges,
        getPolygon: ({points}) =>
          makeLineArrow({
            line: points.slice(points.length - 2).map(({x, y}) => [x, y]),
            l: 10,
            w: 5
          }),
        getFillColor: () => [64, 64, 64],
        getLineColor: () => [64, 64, 64],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLabels() {
    const {
      data: {nodes},
      options: {showLabels}
    } = this.props;
    return showLabels
      ? [
        new TextLayer({
          id: ID + '-text-layer',
          data: nodes,
          getText: ({label}) => label,
          getPosition: ({x, y}) => [x, y],
          getSize: 10,
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY
        })
      ]
      : [];
  }
  _renderLayers() {
    return [
      ...this._renderNodes(),
      ...this._renderEdges(),
      ...this._renderArrows(),
      ...this._renderLabels()
    ];
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
