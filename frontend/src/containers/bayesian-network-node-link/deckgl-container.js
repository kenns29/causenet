import React, {PureComponent} from 'react';
import DeckGL, {OrthographicView} from 'deck.gl';

export default class ContentPanel extends PureComponent {
  _renderLayers() {
    const {data} = this.props;
    console.log('data', data);
    return [];
  }
  render() {
    const {width, height} = this.props;
    const views = [
      new OrthographicView({
        left: 0,
        top: 0,
        width,
        height,
        near: 0
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
