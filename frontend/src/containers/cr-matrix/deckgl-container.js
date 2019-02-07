import React, {PureComponent} from 'react';
import {TextLayer, PathLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';

const ID = 'cr-matrix';

export default class Content extends PureComponent {
  _renderMatrix() {
    const {
      matrix: {cols, rows, cells},
      cellSize: [w, h]
    } = this.props;
    return [
      new MatrixLayer({
        id: ID + '-matrix-layer',
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: ({x, y}) => [x, y],
        getColor: ({color}) => [...color, 255],
        layout: {
          x: 0,
          y: 0,
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
      matrix: {rows}
    } = this.props;
    const data = rows.map((row, index) => {
      const {id, name, x, y} = row;
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
      matrix: {cols}
    } = this.props;
    const data = cols.map((col, index) => {
      const {id, name, x, y} = col;
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
  _renderRowNetwork() {
    const {rowNetwork} = this.props;
    return [
      new PathLayer({
        id: ID + '-row-network',
        data: rowNetwork,
        getPath: d => d.points,
        getWidth: 1,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers() {
    return [
      ...this._renderMatrix(),
      ...this._renderRowTitle(),
      ...this._renderColTitle(),
      ...this._renderRowNetwork()
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
