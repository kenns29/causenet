import React, {PureComponent} from 'react';
import {TextLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';

const ID = 'bayesian-network-matrix';

export default class ContentPanel extends PureComponent {
  _getAlpha = (rowId, colId) => {
    const {highlightedEdge: hc} = this.props;
    return hc
      ? ![[rowId, hc.source], [colId, hc.target]].some(
        ([id, cId]) => id !== null && id !== undefined && id !== cId
      )
        ? 255
        : 50
      : 255;
  };
  _renderMatrix() {
    const {
      matrix: {rows, cols, cells},
      cellSize: [w, h],
      paddings: [paddingH, paddingV],
      highlightedEdge
    } = this.props;

    return [
      new MatrixLayer({
        id: ID + '-matrix-layer',
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: ({x, y}) => [x, y],
        getColor: ({color, row_id: rowId, col_id: colId}) => [
          ...color,
          this._getAlpha(rowId, colId)
        ],
        getLineWidth: ({value}) => (value > 0 ? 1 : 0),
        getLineColor: ({row_id: rowId, col_id: colId}) => [
          150,
          150,
          150,
          this._getAlpha(rowId, colId)
        ],
        stroked: true,
        layout: {
          x: paddingH,
          y: paddingV,
          dx: w,
          dy: h,
          width: cols.length * w,
          height: rows.length * h
        },
        onHover: ({object}) =>
          this.props.updateHighlightedBayesianNetworkEdge(
            object
              ? {
                source: object.row_id,
                target: object.col_id,
                weight: object.value
              }
              : null
          ),
        updateTriggers: {
          getColor: highlightedEdge
        }
      })
    ];
  }
  _renderRowTitle() {
    const {
      matrix: {rows},
      cellSize,
      paddings: [paddingH, paddingV],
      highlightedEdge
    } = this.props;
    const h = cellSize[1];
    const data = rows.map((text, index) => ({
      text,
      position: [paddingH - 5, index * h + h / 2 + paddingV]
    }));
    return [
      new TextLayer({
        id: ID + '-y-axis',
        data,
        getSize: 10,
        getColor: ({text}) => [10, 10, 10, this._getAlpha(text, null)],
        getTextAnchor: 'end',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        updateTriggers: {
          getColor: highlightedEdge
        }
      })
    ];
  }
  _renderColTitle() {
    const {
      matrix: {cols},
      cellSize,
      paddings: [paddingH, paddingV],
      highlightedEdge
    } = this.props;
    const w = cellSize[0];
    const data = cols.map((text, index) => ({
      text,
      position: [index * w + w / 2 + paddingH, paddingV - 5]
    }));
    return [
      new TextLayer({
        id: ID + '-x-axis',
        data,
        getSize: 10,
        getColor: ({text}) => [10, 10, 10, this._getAlpha(null, text)],
        getAngle: 70,
        getTextAnchor: 'start',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        updateTriggers: {
          getColor: highlightedEdge
        }
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
