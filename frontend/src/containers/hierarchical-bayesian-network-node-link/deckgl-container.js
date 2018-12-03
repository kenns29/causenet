import React, {PureComponent} from 'react';
import {TextLayer, PolygonLayer, PathLayer, COORDINATE_SYSTEM} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
import {
  StrokedScatterplotLayer,
  SplineLayer
} from '../../components/deckgl-layers';
import {makeLineArrow} from '../../utils';

const ID = 'hierarchical-bayesian-network-node-link';

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

export default class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hoveredNodes: [],
      zoomScale: 1,
      zoomOffset: [0, 0]
    };
  }
  _renderClusterNodes() {
    const {
      clusterNodeLink: {nodes}
    } = this.props;
    return [
      new PolygonLayer({
        id: ID + '-stroked-scatterplot-layer',
        data: nodes,
        getPolygon: ({x, y, width: w, height: h}) => [
          [x - w / 2, y - h / 2],
          [x + w / 2, y - h / 2],
          [x + w / 2, y + h / 2],
          [x - w / 2, y + h / 2],
          [x - w / 2, y - h / 2]
        ],
        getFillColor: () => [255, 255, 255, 255],
        getLineColor: () => [64, 64, 64, 255],
        getLineWidth: 2,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pickable: true,
        onHover: ({object}) =>
          this.setState({hoveredNodes: object ? [object] : []})
      })
    ];
  }
  _renderClusterEdges() {
    const {
      clusterNodeLink: {edges}
    } = this.props;
    return [
      new PathLayer({
        id: ID + '-path-layer',
        data: edges,
        getPath: ({points}) => points,
        getColor: [64, 64, 64, 255],
        getWidth: () => 2,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderArrows() {
    const {
      clusterNodeLink: {edges}
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
          64,
          64,
          64,
          255
        ],
        getLineColor: ({sourceId, targetId, isRemoved, isBackward}) => [
          64,
          64,
          64,
          255
        ],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers() {
    return [
      ...this._renderClusterNodes(),
      ...this._renderClusterEdges(),
      ...this._renderArrows()
    ];
  }
  _renderTooltip() {
    const {hoveredNodes} = this.state;
    if (this.container && this.container.getDeckObj()) {
      return (
        <React.Fragment>
          {hoveredNodes.map(({label, x, y, cluster}) => {
            const [left, top] = this.container.project([x, y]);
            return (
              <div
                key={label}
                style={{...tooltipStyle, left: left + 10, top: top - 20}}
              >
                {cluster.map(feature => (
                  <div key={feature}>{`${feature}`}</div>
                ))}
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
