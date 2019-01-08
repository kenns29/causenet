import React, {PureComponent} from 'react';
import DeckGL, {
  OrthographicView,
  PolygonLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import {AxisLayer} from '../../components/deckgl-layers';

const ID = 'feature-distribution-histogram';

export default class Content extends PureComponent {
  _renderLayers() {
    return [];
  }
  render() {
    const {containerWidth: width, containerHeight: height} = this.props;
    const views = [
      new OrthographicView({
        right: width,
        bottom: height,
        top: 0,
        left: 0,
        width,
        height
      })
    ];
    return (
      <DeckGL
        width={width}
        height={height}
        views={views}
        layers={this._renderLayers()}
      />
    );
  }
}
