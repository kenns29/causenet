import React, {PureComponent} from 'react';
import {
  ScatterplotLayer,
  PathLayer,
  TextLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
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
  _renderLabels() {
    const {
      data: {nodes}
    } = this.props;
    return [
      new TextLayer({
        id: ID + '-text-layer',
        data: nodes,
        getText: ({label}) => label,
        getPosition: ({x, y}) => [x, y],
        getSize: 10,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers() {
    const {
      options: {showLabels}
    } = this.props;
    let layers = [...this._renderNodes(), ...this._renderEdges()];
    if (showLabels) {
      layers = layers.concat(this._renderLabels());
    }
    return layers;
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
