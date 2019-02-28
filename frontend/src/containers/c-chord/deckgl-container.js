import React, {PureComponent} from 'react';
import {TextLayer, PathLayer, PolygonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';

const ID = 'c-chord';

export default class Content extends PureComponent {
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
        top={0}
        left={0}
        bottom={height}
        right={width}
        layers={this._renderLayers()}
      />
    );
  }
}
