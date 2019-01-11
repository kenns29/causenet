import React, {PureComponent} from 'react';
import DeckGL, {OrthographicView} from 'deck.gl';

export default class ContentPanel extends PureComponent {
  _renderLayers() {
    return [];
  }
  render() {
    const {width, height} = this.props;
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
