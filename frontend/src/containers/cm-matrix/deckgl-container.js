import React, {PureComponent} from 'react';
import {
  TextLayer,
  PathLayer,
  LineLayer,
  PolygonLayer,
  ScatterplotLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';
import {makeTextLengthComputer, rotatePolygonOnZ} from '../../utils';

const ID = 'cm-matrix';

export default class Content extends PureComponent {
  _computeTextLength = makeTextLengthComputer({fontSize: 10});

  _renderMatrix() {
    const {
      matrix: {cols, rows, cells},
      cellSize: [w, h]
    } = this.props;

    const radius = Math.min(w, h) / 2;
    const nonCells = cells.filter(cell => cell.data.corr === 0);
    const undecidedCells = cells.filter(
      cell => cell.data.corr !== 0 && cell.data.isUndecided
    );
    const causeCells = cells.filter(
      cell =>
        cell.data.corr !== 0 && !cell.data.isUndecided && !cell.data.isSpurious
    );
    const spuriousCells = cells.filter(
      cell =>
        cell.data.corr !== 0 && !cell.data.isUndecided && cell.data.isSpurious
    );
    console.log('causeCells', causeCells);
    console.log('spuriousCells', spuriousCells);
    return [
      new PolygonLayer({
        id: `${ID}-cause-cells`,
        data: causeCells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPolygon: ({x, y}) => [
          [x + w / 2, y],
          [x + w, y + h / 2],
          [x + w / 2, y + h],
          [x, y + h / 2],
          [x + w / 2, y]
        ],
        stroked: true,
        getLineWidth: 1,
        getLineColor: [255, 255, 255, 255],
        getFillColor: d => d.color,
        pickable: true
      }),
      new LineLayer({
        id: `${ID}-non-cells`,
        data: nonCells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getSourcePosition: ({x, y}) => [x, y + h],
        getTargetPosition: ({x, y}) => [x + w, y],
        getColor: [60, 60, 60],
        pickable: true
      }),
      new PolygonLayer({
        id: `${ID}-undecided-cells`,
        data: undecidedCells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPolygon: ({x, y}) => [
          [x, y],
          [x, y + h],
          [x + w, y + h],
          [x + w, y],
          [x, y]
        ],
        stroked: true,
        getLineWidth: 1,
        getLineColor: [255, 255, 255, 255],
        getFillColor: d => d.color,
        pickable: true
      }),
      new ScatterplotLayer({
        id: `${ID}-spurious-cells`,
        data: spuriousCells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: ({x, y}) => [x + w / 2, y + h / 2],
        getRadius: radius,
        getColor: d => d.color,
        pickable: true
      })
    ];
  }

  _renderRowTitle() {
    const {
      matrix: {rows},
      cellSize: [w, h]
    } = this.props;
    const data = rows.map((row, index) => {
      const {id, name, x, y} = row;
      const len = this._computeTextLength(name);
      return {
        id,
        name,
        position: [x, y],
        polygon: [
          [x, y - h / 2],
          [x, y + h / 2],
          [x - len, y + h / 2],
          [x - len, y - h / 2],
          [x, y - h / 2]
        ]
      };
    });
    return data.length
      ? [
        new PolygonLayer({
          id: ID + '-y-axis-polygon',
          data,
          getFillColor: [255, 255, 255],
          getLineWidth: 0,
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          pickable: true
        }),
        new TextLayer({
          id: ID + '-y-axis',
          data,
          getSize: 10,
          getText: d => d.name,
          getPosition: d => d.position,
          getColor: [10, 10, 10],
          getTextAnchor: 'end',
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          pickable: true
        })
      ]
      : [];
  }

  _renderColTitle() {
    const {
      matrix: {cols},
      cellSize: [w, h]
    } = this.props;
    const data = cols.map((col, index) => {
      const {id, name, x, y} = col;
      const len = this._computeTextLength(name);
      return {
        id,
        name,
        position: [x, y],
        polygon: rotatePolygonOnZ({
          points: [
            [x, y - h / 2],
            [x, y + h / 2],
            [x + len, y + h / 2],
            [x + len, y - h / 2],
            [x, y - h / 2]
          ],
          origin: [x, y, 0],
          theta: (-90 / 180) * Math.PI
        })
      };
    });
    return data.length
      ? [
        new PolygonLayer({
          id: ID + '-x-axis-polygon',
          data,
          getFillColor: [255, 255, 255],
          getLineWidth: 0,
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          pickable: true
        }),
        new TextLayer({
          id: ID + '-x-axis',
          data,
          getSize: 10,
          getText: d => d.name,
          getPosition: d => d.position,
          getColor: [10, 10, 10],
          getTextAnchor: 'start',
          getAngle: 90,
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          pickable: true
        })
      ]
      : [];
  }

  _renderLayers() {
    return [
      ...this._renderMatrix(),
      ...this._renderRowTitle(),
      ...this._renderColTitle()
    ];
  }

  render() {
    const {width, height, getCursor} = this.props;
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
