import React, {PureComponent} from 'react';
import {PathLayer, TextLayer, PolygonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
import {StrokedScatterplotLayer} from '../../components/deckgl-layers';
import {makeLineArrow} from '../../utils';

const ID = 'bayesian-network-node-link';

export default class ContentPanel extends PureComponent {
  _getAlpha = (source, target) => {
    const {highlightedEdge} = this.props;
    if (!highlightedEdge) {
      return 255;
    }
    if (target === null || target === undefined) {
      return source === highlightedEdge.source ||
        source === highlightedEdge.target
        ? 255
        : 50;
    }
    return source === highlightedEdge.source &&
      target === highlightedEdge.target
      ? 255
      : 50;
  };
  _renderNodes() {
    const {
      data: {nodes},
      options: {showLabels},
      highlightedEdge
    } = this.props;
    return [
      new StrokedScatterplotLayer({
        id: ID + '-stroked-scatterplot-layer',
        data: nodes,
        getPosition: ({x, y}) => [x, y],
        getRadius: ({width, height}) => Math.max(width, height) / 2,
        getFillColor: ({label}) =>
          showLabels
            ? [255, 255, 255, this._getAlpha(label)]
            : [64, 64, 64, this._getAlpha(label)],
        getStrokeColor: ({label}) =>
          showLabels
            ? [180, 180, 180, this._getAlpha(label)]
            : [64, 64, 64, this._getAlpha(label)],
        strokeWidth: 2,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        updateTriggers: {
          getFillColor: showLabels || highlightedEdge,
          getStrokeColor: showLabels || highlightedEdge
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
      getPath: ({points}) => points.map(({x, y}) => [x, y]),
      getWidth: () => 1,
      getColor: ({sourceId, targetId}) => [
        64,
        64,
        64,
        this._getAlpha(sourceId, targetId)
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
      getWidth: () => 10,
      getColor: [255, 255, 255],
      pickable: true,
      updateTriggers: {}
    };
    return [new PathLayer(backgroundProps), new PathLayer(pathProps)];
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
            line: points.slice(points.length - 2).map(({x, y}) => [x, y]),
            l: 10,
            w: 5
          }),
        getFillColor: ({sourceId, targetId}) => [
          64,
          64,
          64,
          this._getAlpha(sourceId, targetId)
        ],
        getLineColor: ({sourceId, targetId}) => [
          64,
          64,
          64,
          this._getAlpha(sourceId, targetId)
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
          getColor: ({label}) => [0, 0, 0, this._getAlpha(label)],
          getSize: 10,
          getAngle: 45,
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
        getCursor={() => 'auto'}
      />
    );
  }
}
