import React, {PureComponent} from 'react';
import {TextLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';

const ID = 'cr-matrix';

export default class Content extends PureComponent {
  _renderMatrix() {
    const {
      matrix: {rows, cols, cells},
      cellSize: [w, h],
      paddings: [ph, pv]
    } = this.props;
    return [
      new MatrixLayer({
        id: ID + '-matrix-layer',
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: ({x, y}) => [x, y],
        getColor: ({color}) => [...color, 255],
        layout: {
          x: ph,
          y: pv,
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
      cellSize: [w, h],
      paddings: [ph, pv]
    } = this.props;
    const data = rows.map((row, index) => {
      const [x, y] = [ph - 5, index * h + h / 2 + pv];
      const {id, name} = row;
      return {
        id,
        name,
        position: [x, y]
      };
    });
    return [
      new TextLayer({
        id: ID + '-y-axis',
        data,
        getSize: 10,
        getText: d => d.name,
        getPosition: d => d.position,
        getColor: [10, 10, 10],
        getTextAnchor: 'end',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderColTitle() {
    const {
      matrix: {cols},
      cellSize: [w, h],
      paddings: [ph, pv]
    } = this.props;
    const data = cols.map((col, index) => {
      const [x, y] = [index * w + w / 2 + ph, pv - 5];
      const {id, name} = col;
      return {
        id,
        name,
        position: [x, y]
      };
    });
    return [
      new TextLayer({
        id: ID + '-x-axis',
        data,
        getSize: 10,
        getText: d => d.name,
        getPosition: d => d.position,
        getColor: [10, 10, 10],
        getTextAnchor: 'start',
        getAngle: 90,
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
