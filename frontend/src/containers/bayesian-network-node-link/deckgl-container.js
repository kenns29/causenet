import React, {PureComponent} from 'react';
import {TextLayer, PolygonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
import {
  StrokedScatterplotLayer,
  SplineLayer
} from '../../components/deckgl-layers';
import {makeLineArrow} from '../../utils';

const ID = 'bayesian-network-node-link';

const tooltipStyle = {
  position: 'absolute',
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9,
  pointerEvents: 'none'
};

const FORWARD_EDGE_COLOR = [8, 8, 8];
const BACKWARD_EDGE_COLOR = [200, 8, 8];

export default class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hoveredNodes: [],
      zoomScale: 1,
      zoomOffset: [0, 0]
    };
  }
  _isHighlighted = (source, target) => {
    const {highlightedEdge} = this.props;
    return (
      highlightedEdge &&
      (target
        ? source === highlightedEdge.source && target === highlightedEdge.target
        : source === highlightedEdge.source ||
          source === highlightedEdge.target)
    );
  };
  _getAlpha = (source, target, isRemoved) => {
    if (isRemoved) {
      return 50;
    }
    const {highlightedEdge} = this.props;
    if (!highlightedEdge) {
      return 255;
    }
    return this._isHighlighted(source, target) ? 255 : 50;
  };
  _renderNodes() {
    const {
      data: {nodes},
      options: {showLabels},
      highlightedEdge,
      highlightedFeature
    } = this.props;
    return [
      new StrokedScatterplotLayer({
        id: ID + '-stroked-scatterplot-layer',
        data: nodes,
        getPosition: ({x, y}) => [x, y],
        getRadius: ({width, height}) => Math.max(width, height) / 2,
        getFillColor: ({label, isRemoved}) =>
          showLabels
            ? [255, 255, 255, this._getAlpha(label, null, isRemoved)]
            : [
              ...(highlightedFeature === label
                ? [255, 140, 0]
                : [64, 64, 64]),
              this._getAlpha(label, null, isRemoved)
            ],
        getStrokeColor: ({label, isRemoved}) =>
          showLabels
            ? [
              ...(highlightedFeature === label
                ? [255, 140, 0]
                : [180, 180, 180]),
              this._getAlpha(label, null, isRemoved)
            ]
            : [
              ...(highlightedFeature === label
                ? [255, 140, 0]
                : [64, 64, 64]),
              this._getAlpha(label, null, isRemoved)
            ],
        strokeWidth: 2,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pickable: true,
        onClick: ({object}) =>
          this.props.updateHighlightedBayesianModelFeature(
            object
              ? highlightedFeature && highlightedFeature === object.label
                ? null
                : object.label
              : null
          ),
        onHover: ({object}) =>
          this.setState({hoveredNodes: object ? [object] : []}),
        updateTriggers: {
          getFillColor: [showLabels, highlightedEdge, highlightedFeature],
          getStrokeColor: [showLabels, highlightedEdge, highlightedFeature]
        }
      })
    ];
  }
  _renderEdges() {
    const {
      data: {edges},
      highlightedEdge
    } = this.props;
    const pathProps = {
      id: ID + '-path-layer',
      data: edges,
      getSourcePosition: ({points}) => points[0].slice(0, 2),
      getTargetPosition: ({points}) => points[points.length - 1].slice(0, 2),
      getControlPoints: ({points}) =>
        points.slice(1, points.length - 1).map(([x, y, z]) => [x, y]),
      getStrokeWidth: 1,
      getColor: ({sourceId, targetId, isRemoved, isBackward}) => [
        ...(isBackward ? BACKWARD_EDGE_COLOR : FORWARD_EDGE_COLOR),
        this._getAlpha(sourceId, targetId, isRemoved)
      ],
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      pickable: true,
      onHover: ({object}) =>
        this.props.updateHighlightedBayesianNetworkEdge(
          object
            ? {
              source: object.sourceId,
              target: object.targetId,
              weight: object.weight
            }
            : null
        ),
      updateTriggers: {
        getColor: highlightedEdge
      }
    };
    const backgroundProps = {
      ...pathProps,
      id: ID + '-path-layer-background',
      getStrokeWidth: 15,
      getColor: [255, 255, 255],
      pickable: true,
      updateTriggers: {}
    };
    return [new SplineLayer(backgroundProps), new SplineLayer(pathProps)];
  }
  _renderArrows() {
    const {
      data: {edges},
      highlightedEdge
    } = this.props;
    return [
      new PolygonLayer({
        id: ID + '-arrow-layer',
        data: edges,
        getPolygon: ({points}) =>
          makeLineArrow({
            line: points.slice(points.length - 2),
            l: 10,
            w: 5
          }),
        getFillColor: ({sourceId, targetId, isRemoved, isBackward}) => [
          ...(isBackward ? BACKWARD_EDGE_COLOR : FORWARD_EDGE_COLOR),
          this._getAlpha(sourceId, targetId, isRemoved)
        ],
        getLineColor: ({sourceId, targetId, isRemoved, isBackward}) => [
          ...(isBackward ? BACKWARD_EDGE_COLOR : FORWARD_EDGE_COLOR),
          this._getAlpha(sourceId, targetId, isRemoved)
        ],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        updateTriggers: {
          getFillColor: highlightedEdge,
          getLineColor: highlightedEdge
        }
      })
    ];
  }
  _renderLabels() {
    const {
      data: {nodes},
      options: {showLabels},
      highlightedEdge
    } = this.props;
    return showLabels
      ? [
        new TextLayer({
          id: ID + '-text-layer',
          data: nodes,
          getText: ({label}) => label,
          getPosition: ({x, y}) => [x, y],
          getColor: ({label, isRemoved}) => [
            0,
            0,
            0,
            this._getAlpha(label, null, isRemoved)
          ],
          getSize: 10,
          getAngle: 30,
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          updateTriggers: {
            getColor: highlightedEdge
          }
        })
      ]
      : [];
  }
  _renderLayers() {
    return [
      ...this._renderEdges(),
      ...this._renderNodes(),
      ...this._renderArrows(),
      ...this._renderLabels()
    ];
  }
  _renderTooltip() {
    const {hoveredNodes} = this.state;
    if (this.container && this.container.getDeckObj()) {
      return (
        <React.Fragment>
          {hoveredNodes.map(({label, x, y}) => {
            const [left, top] = this.container.project([x, y]);
            return (
              <div
                key={label}
                style={{...tooltipStyle, left: left + 10, top: top - 20}}
              >
                {label}
              </div>
            );
          })}
        </React.Fragment>
      );
    }
    return null;
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
        overlay={this._renderTooltip()}
        getCursor={() => 'auto'}
        onZoom={zoomScale => this.setState({zoomScale})}
        onMove={zoomOffset => this.setState({zoomOffset})}
      />
    );
  }
}
