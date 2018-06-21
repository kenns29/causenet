import React, {PureComponent} from 'react';
import DeckGL, {OrthographicView, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from './deckgl-layers';

export default class ContentPanel extends PureComponent {
  _renderMatrix() {
    const {
      matrix,
      cellSize: [w, h]
    } = this.props;
    const {rows, cols, cells} = matrix;

    return [
      new MatrixLayer({
        id: 'matrix-layer',
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => [d.x, d.y],
        getColor: d => (d.value ? [10, 10, 10] : [255, 255, 255]),
        layout: {
          x: 0,
          y: 0,
          dx: w,
          dy: h,
          width: rows.length * w,
          height: cols.length * h
        }
      })
    ];
  }
  _renderLayers() {
    return [...this._renderMatrix()];
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
