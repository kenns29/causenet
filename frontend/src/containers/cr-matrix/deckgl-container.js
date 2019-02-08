import React, {PureComponent} from 'react';
import {TextLayer, PathLayer, PolygonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';
import {
  makeLineArrow,
  makeTextLengthComputer,
  rotatePolygonOnZ
} from '../../utils';

const ID = 'cr-matrix';

export default class Content extends PureComponent {
  _computeTextLength = makeTextLengthComputer({fontSize: 10});

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
    return [
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
    ];
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
    return [
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
    ];
  }

  _renderRowNetwork() {
    if (!this.props.options.showRowNetwork) {
      return [];
    }
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

  _renderRowNetworkArrows() {
    if (!this.props.options.showRowNetwork) {
      return [];
    }
    const {rowNetwork} = this.props;
    return [
      new PolygonLayer({
        id: ID + '-row-network-arrows',
        data: rowNetwork,
        getPolygon: ({points}) =>
          makeLineArrow({
            line: points.slice(points.length - 2),
            l: 7,
            w: 3.5
          }),
        getFillColor: [10, 10, 10],
        getLineColor: [10, 10, 10],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }

  _renderColNetwork() {
    if (!this.props.options.showColNetwork) {
      return [];
    }
    const {colNetwork} = this.props;
    return [
      new PathLayer({
        id: ID + '-col-network',
        data: colNetwork,
        getPath: d => d.points,
        getWidth: 1,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }

  _renderColNetworkArrows() {
    if (!this.props.options.showColNetwork) {
      return [];
    }
    const {colNetwork} = this.props;
    return [
      new PolygonLayer({
        id: ID + '-col-network-arrows',
        data: colNetwork,
        getPolygon: ({points}) =>
          makeLineArrow({
            line: points.slice(points.length - 2),
            l: 7,
            w: 3.5
          }),
        getFillColor: [10, 10, 10],
        getLineColor: [10, 10, 10],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }

  _renderCrossNetwork() {
    if (!this.props.options.showCrossNetwork) {
      return [];
    }
    const {crossNetwork} = this.props;
    return [
      new PathLayer({
        id: ID + '-cross-network',
        data: crossNetwork,
        getPath: d => d.points,
        getWidth: 1,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }

  _renderCrossNetworkArrows() {
    if (!this.props.options.showCrossNetwork) {
      return [];
    }
    const {crossNetwork} = this.props;
    return [
      new PolygonLayer({
        id: ID + '-cross-network-arrows',
        data: crossNetwork,
        getPolygon: ({points}) =>
          makeLineArrow({
            line: points.slice(points.length - 2),
            l: 7,
            w: 3.5
          }),
        getFillColor: [10, 10, 10],
        getLineColor: [10, 10, 10],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }

  _renderLayers() {
    return [
      ...this._renderMatrix(),
      ...this._renderRowTitle(),
      ...this._renderColTitle(),
      ...this._renderRowNetwork(),
      ...this._renderRowNetworkArrows(),
      ...this._renderColNetwork(),
      ...this._renderColNetworkArrows(),
      ...this._renderCrossNetwork(),
      ...this._renderCrossNetworkArrows()
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
        getCursor={getCursor}
      />
    );
  }
}
