import React, {PureComponent} from 'react';
import DeckGL, {
  OrthographicView,
  ScatterplotLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';

export default class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
  }
  _renderLayers() {
    const {data} = this.props;
    return [
      new ScatterplotLayer({
        id: 'random',
        data,
        getRadius: 2,
        getPosition: d => d.position,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  render() {
    const [width, height] = [400, 400];
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
