import React, {PureComponent} from 'react';
import {TextLayer, PathLayer, PolygonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';

const ID = 'corr-matrix';

export default class Content extends PureComponent {
  _renderLayers() {
    return [];
  }
  render() {
    const {width, height, getCursor} = this.props;
    return (
      <ZoomableContainer
        ref={input => (this.container = input)}
        width={width}
        height={height}
        top={0}
        left={0}
        bottom={height}
        right={width}
        layers={this._renderLayers()}
      />
    );
  }
}
