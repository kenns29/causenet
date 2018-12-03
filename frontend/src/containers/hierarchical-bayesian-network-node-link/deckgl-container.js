import React, {PureComponent} from 'react';
import {TextLayer, PolygonLayer, PathLayer, COORDINATE_SYSTEM} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
import {
  StrokedScatterplotLayer,
  SplineLayer
} from '../../components/deckgl-layers';
import {makeLineArrow} from '../../utils';

const ID = 'hierarchical-bayesian-network-node-link';

export default class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hoveredNodes: [],
      zoomScale: 1,
      zoomOffset: [0, 0]
    };
  }
  _renderClusterNodes() {
    const {
      clusterNodeLink: {nodes}
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
  _renderClusterEdges() {
    const {
      clusterNodeLink: {edges}
    } = this.props;
    return [
      new PathLayer({
        id: ID + '-path-layer',
        data: edges,
        getPath: ({points}) => points,
        getColor: [64, 64, 64, 255],
        getWidth: () => 2,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderArrows() {
    const {
      clusterNodeLink: {edges}
    } = this.props;
    return [
      new PolygonLayer({
        id: ID + '-arrow-layer',
        data: edges,
        getPolygon: ({points}) =>
          makeLineArrow({
            line: points.slice(points.length - 2),
            l: 10,
            w: 5
          }),
        getFillColor: ({sourceId, targetId, isRemoved, isBackward}) => [
          64,
          64,
          64,
          255
        ],
        getLineColor: ({sourceId, targetId, isRemoved, isBackward}) => [
          64,
          64,
          64,
          255
        ],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers() {
    return [
      ...this._renderClusterNodes(),
      ...this._renderClusterEdges(),
      ...this._renderArrows()
    ];
  }
  render() {
    const {width, height} = this.props;
    return (
      <ZoomableContainer
        ref={input => (this.container = input)}
        width={width}
        height={height}
        left={0}
        right={width}
        bottom={height}
        top={0}
        layers={this._renderLayers()}
        getCursor={() => 'auto'}
        onZoom={zoomScale => this.setState({zoomScale})}
        onMove={zoomOffset => this.setState({zoomOffset})}
      />
    );
  }
}
