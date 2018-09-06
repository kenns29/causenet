import React, {PureComponent} from 'react';
import {
  TextLayer,
  ScatterplotLayer,
  LineLayer,
  PolygonLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import {MatrixLayer} from '../../components/deckgl-layers';
import ZoomableContainer from '../../components/zoomable-container';
import {makeTextLengthComputer, rotatePolygonOnZ} from '../../utils';

const PANEL_ID_PREFIX = 'clustering-matrix-';
export default class Container extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      highlightedCell: null,
      zoomScale: 1
    };
  }
  _computeTextLength = makeTextLengthComputer({fontSize: 10});
  _getAlpha = (rowId, colId) => {
    const {highlightedCell: hc} = this.state;
    return hc
      ? ![[rowId, hc.row_id], [colId, hc.col_id]].some(
        ([id, cId]) => id !== null && id !== undefined && id !== cId
      )
        ? 255
        : 50
      : 255;
  };
  _toggleFeatureSelection = feature => {
    const {featureSelection} = this.props;
    if (featureSelection === null) {
      this.props.requestUpdateFeatureSelection([feature]);
    } else {
      const filtered = featureSelection.filter(d => d !== feature);
      this.props.requestUpdateFeatureSelection(
        filtered.length
          ? filtered.length < featureSelection.length
            ? filtered
            : featureSelection.concat(feature)
          : null
      );
    }
  };
  _renderMatrix() {
    const {
      matrix: {rows, cols, cells},
      cellSize: [w, h],
      paddings: [paddingH, paddingV]
    } = this.props;
    const {highlightedCell} = this.state;
    return [
      new MatrixLayer({
        id: PANEL_ID_PREFIX + 'matrix-layer',
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: ({x, y}) => [x, y],
        getColor: ({color, row_id: rowId, col_id: colId}) => [
          ...color,
          this._getAlpha(rowId, colId)
        ],
        layout: {
          x: paddingH,
          y: paddingV,
          dx: w,
          dy: h,
          width: cols.length * w,
          height: rows.length * h
        },
        onHover: ({object}) => {
          this.setState({highlightedCell: object || null});
        },
        updateTriggers: {
          getColor: highlightedCell
        }
      })
    ];
  }
  _renderRowTitle() {
    const {
      matrix: {rows},
      cellSize: [w, h],
      paddings: [paddingH, paddingV]
    } = this.props;
    const {zoomScale} = this.state;
    const matrixWidth = rows.length * w;
    const data = rows.map((row, index) => {
      const {name} = row;
      const [x, y] = [paddingH + matrixWidth + 5, index * h + h / 2 + paddingV];
      const len = this._computeTextLength(name);
      const [slen, sh] = [len, h].map(d => d * zoomScale);
      return {
        ...row,
        position: [x, y],
        polygon: [
          [x, y - sh / 2],
          [x, y + sh / 2],
          [x + slen, y + sh / 2],
          [x + slen, y - sh / 2]
        ]
      };
    });
    return [
      new PolygonLayer({
        id: PANEL_ID_PREFIX + 'y-axis-cluster',
        data,
        getFillColor: ({name, isCluster}) =>
          isCluster
            ? [180, 180, 180, this._getAlpha(name, null)]
            : [255, 255, 255, 50],
        getLineWidth: 0,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pickable: true,
        onClick: ({object}) =>
          object && this._toggleFeatureSelection(object.name)
      }),
      new TextLayer({
        id: PANEL_ID_PREFIX + 'y-axis',
        data,
        getSize: 10,
        getText: ({name}) => name,
        getColor: ({name, isSelection}) => [
          ...(isSelection ? [200, 10, 200] : [10, 10, 10]),
          this._getAlpha(name, null)
        ],
        getTextAnchor: 'start',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pickable: true,
        onClick: ({object}) =>
          object && this._toggleFeatureSelection(object.name)
      })
    ];
  }
  _renderColTitle() {
    const {
      matrix: {cols},
      cellSize: [w, h],
      paddings: [paddingH, paddingV]
    } = this.props;
    const {zoomScale} = this.state;
    const matrixHeight = cols.length * h;
    const data = cols.map((row, index) => {
      const {name} = row;
      const [x, y] = [
        index * w + w / 2 + paddingH,
        paddingV + matrixHeight + 5
      ];
      const len = this._computeTextLength(name);
      const [slen, sh] = [len, h].map(d => d * zoomScale);
      return {
        ...row,
        position: [x, y],
        polygon: rotatePolygonOnZ({
          points: [
            [x, y - sh / 2],
            [x, y + sh / 2],
            [x - slen, y + sh / 2],
            [x - slen, y - sh / 2]
          ],
          origin: [x, y, 0],
          theta: (-70 / 180) * Math.PI
        })
      };
    });
    return [
      new PolygonLayer({
        id: PANEL_ID_PREFIX + 'x-axis-cluster',
        data,
        getFillColor: ({name, isCluster}) =>
          isCluster
            ? [180, 180, 180, this._getAlpha(null, name)]
            : [255, 255, 255, 50],
        getLineWidth: 0,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pickable: true,
        onClick: ({object}) =>
          object && this._toggleFeatureSelection(object.name)
      }),
      new TextLayer({
        id: PANEL_ID_PREFIX + 'x-axis',
        data,
        getSize: 10,
        getText: ({name}) => name,
        getColor: ({name, isSelection}) => [
          ...(isSelection ? [200, 10, 200] : [10, 10, 10]),
          this._getAlpha(null, name)
        ],
        getAngle: 70,
        getTextAnchor: 'end',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pickable: true,
        onClick: ({object}) =>
          object && this._toggleFeatureSelection(object.name)
      })
    ];
  }
  _renderColTree() {
    const {
      colTree: {nodes, links},
      paddings: [paddingH, paddingV]
    } = this.props;
    return [
      new ScatterplotLayer({
        id: PANEL_ID_PREFIX + 'col-tree-nodes',
        data: nodes,
        getRadius: 2,
        getColor: [100, 100, 100],
        getPosition: ({x, y}) => [x + paddingH, y + paddingV - 10],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      }),
      new LineLayer({
        id: PANEL_ID_PREFIX + 'col-tree-lines',
        data: links,
        getColor: [100, 100, 100],
        getStrokeWidth: 1,
        getSourcePosition: ({sourcePosition: [x, y]}) => [
          x + paddingH,
          y + paddingV - 10
        ],
        getTargetPosition: ({targetPosition: [x, y]}) => [
          x + paddingH,
          y + paddingV - 10
        ],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderRowTree() {
    const {
      rowTree: {nodes, links},
      paddings: [paddingH, paddingV]
    } = this.props;
    return [
      new ScatterplotLayer({
        id: PANEL_ID_PREFIX + 'row-tree-nodes',
        data: nodes,
        getRadius: 2,
        getColor: [100, 100, 100],
        getPosition: ({x, y}) => [x + paddingH - 10, y + paddingV],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      }),
      new LineLayer({
        id: PANEL_ID_PREFIX + 'row-tree-lines',
        data: links,
        getColor: [100, 100, 100],
        getStrokeWidth: 1,
        getSourcePosition: ({sourcePosition: [x, y]}) => [
          x + paddingH - 10,
          y + paddingV
        ],
        getTargetPosition: ({targetPosition: [x, y]}) => [
          x + paddingH - 10,
          y + paddingV
        ],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers() {
    return [
      ...this._renderMatrix(),
      ...this._renderRowTitle(),
      ...this._renderColTitle(),
      ...this._renderColTree(),
      ...this._renderRowTree()
    ];
  }
  render() {
    const {width, height} = this.props;
    return (
      <ZoomableContainer
        ref={input => (this.container = input)}
        width={width}
        height={height}
        left={0}
        right={width}
        bottom={height}
        top={0}
        layers={this._renderLayers()}
        getCursor={() => 'pointer'}
        onZoom={zoomScale => {
          this.setState({zoomScale});
        }}
      />
    );
  }
}
