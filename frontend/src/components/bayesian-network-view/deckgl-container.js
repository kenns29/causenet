import React, {PureComponent} from 'react';
import DeckGL, {OrthographicView, TextLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from './deckgl-layers';

export default class ContentPanel extends PureComponent {
  _renderMatrix() {
    const {
      matrix: {rows, cols, cells},
      cellSize: [w, h],
      paddings: [paddingH, paddingV]
    } = this.props;

    return [
      new MatrixLayer({
        id: 'matrix-layer',
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => [d.x, d.y],
        getColor: d => d.color,
        layout: {
          x: paddingH,
          y: paddingV,
          dx: w,
          dy: h,
          width: rows.length * w,
          height: cols.length * h
        }
      })
    ];
  }
  _renderRowTitle() {
    const {
      matrix: {rows},
      cellSize,
      paddings: [paddingH, paddingV]
    } = this.props;
    const h = cellSize[1];
    const data = rows.map((text, index) => ({
      text,
      position: [paddingH - 5, index * h + h / 2 + paddingV],
      size: 15,
      color: [10, 10, 10],
      textAnchor: 'end'
    }));
    return [
      new TextLayer({
        id: 'y-axis',
        data,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderColTitle() {
    const {
      matrix: {cols},
      cellSize,
      paddings: [paddingH, paddingV]
    } = this.props;
    const w = cellSize[0];
    const data = cols.map((text, index) => ({
      text,
      position: [index * w + w / 2 + paddingH, paddingV - 5],
      size: 15,
      color: [10, 10, 10],
      angle: 70,
      textAnchor: 'start'
    }));
    return [
      new TextLayer({
        id: 'x-axis',
        data,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers() {
    return [
      ...this._renderMatrix(),
      ...this._renderRowTitle(),
      ...this._renderColTitle()
    ];
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
