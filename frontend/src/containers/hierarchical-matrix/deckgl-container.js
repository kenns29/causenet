import React, {PureComponent} from 'react';
import {TextLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';

const PANEL_ID_PREFIX = 'clustering-matrix-';
export default class Container extends PureComponent {
  _renderMatrix() {
    const {
      matrix: {rows, cols, cells},
      cellSize: [w, h],
      paddings: [paddingH, paddingV]
    } = this.props;

    return [
      new MatrixLayer({
        id: PANEL_ID_PREFIX + 'matrix-layer',
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => [d.x, d.y],
        getColor: d => d.color,
        layout: {
          x: paddingH,
          y: paddingV,
          dx: w,
          dy: h,
          width: cols.length * w,
          height: rows.length * h
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
      position: [paddingH - 5, index * h + h / 2 + paddingV]
    }));
    return [
      new TextLayer({
        id: PANEL_ID_PREFIX + 'y-axis',
        data,
        getSize: 10,
        getColor: [10, 10, 10],
        getTextAnchor: 'end',
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
      position: [index * w + w / 2 + paddingH, paddingV - 5]
    }));
    return [
      new TextLayer({
        id: PANEL_ID_PREFIX + 'x-axis',
        data,
        getSize: 10,
        getColor: [10, 10, 10],
        getAngle: 70,
        getTextAnchor: 'start',
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
    return (
      <ZoomableContainer
        width={width}
        height={height}
        left={0}
        right={width}
        bottom={height}
        top={0}
        layers={this._renderLayers()}
      />
    );
  }
}
