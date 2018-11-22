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
  _renderLayers() {
    return [];
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
