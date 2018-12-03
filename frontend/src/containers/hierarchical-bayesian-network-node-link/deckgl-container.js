import React, {PureComponent} from 'react';
import {TextLayer, PolygonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
import {
  StrokedScatterplotLayer,
  SplineLayer
} from '../../components/deckgl-layers';
import {makeLineArrow} from '../../utils';

const ID = 'hierarchical-bayesian-network-node-link';

const tooltipStyle = {
  position: 'absolute',
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9,
  pointerEvents: 'none'
};

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
        id: ID + '-stroked-scatterplot-layer',
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
        pickable: true,
        onHover: ({object}) =>
          this.setState({hoveredNodes: object ? [object] : []})
      })
    ];
  }
  _renderLayers() {
    return [...this._renderClusterNodes()];
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
