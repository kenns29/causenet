import React, {PureComponent} from 'react';
import {
  TextLayer,
  PolygonLayer,
  PathLayer,
  ScatterplotLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import ZoomableContainer from '../../components/zoomable-container';
import {makeLineArrow} from '../../utils';

const ID = 'hierarchical-bayesian-network-node-link';

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
        id: ID + '-nodes-layer',
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
        pickable: true
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
  _renderClusterArrows() {
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
        getFillColor: () => [64, 64, 64, 255],
        getLineColor: () => [64, 64, 64, 255],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderSubNodeLinks() {
    const {subNodeLinks} = this.props;
    return [].concat(
      ...subNodeLinks.map(({key, nodes, edges}) => [
        ...this._renderSubNodes(nodes, key),
        ...this._renderSubEdges(edges, key),
        ...this._renderSubArrows(edges, key)
      ])
    );
  }
  _renderSubNodes(nodes, id) {
    return [
      new ScatterplotLayer({
        id: ID + '-sub-nodes-layer-' + id,
        data: nodes,
        getPosition: ({x, y}) => [x, y],
        getRadius: 2,
        getColor: [0, 0, 255, 255],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderSubEdges(edges, id) {
    const pathProps = {
      id: ID + '-sub-path-layer-' + id,
      data: edges,
      getPath: ({points}) => points,
      getColor: [100, 100, 100, 255],
      getWidth: 2,
      getDashArray: ({path}) => (path.length > 1 ? [5, 5] : [0, 0]),
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      pickable: true
    };
    const backgroundProps = {
      ...pathProps,
      id: ID + '-sub-path-layer-background-' + id,
      getColor: [255, 255, 255, 255],
      getWidth: 5,
      getDashArray: [0, 0]
    };
    return [new PathLayer(backgroundProps), new PathLayer(pathProps)];
  }
  _renderSubArrows(edges, id) {
    return [
      new PolygonLayer({
        id: ID + '-sub-arrow-layer-' + id,
        data: edges,
        getPolygon: ({points}) =>
          makeLineArrow({
            line: points.slice(points.length - 2),
            l: 10,
            w: 5
          }),
        getFillColor: () => [100, 100, 100, 255],
        getLineColor: () => [100, 100, 100, 255],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      })
    ];
  }
  _renderLayers() {
    return [
      ...this._renderClusterNodes(),
      ...this._renderClusterEdges(),
      ...this._renderClusterArrows(),
      ...this._renderSubNodeLinks()
    ];
  }
  render() {
    const {width, height, disableZoom, disableMove} = this.props;
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
        getCursor={() => 'auto'}
        onZoom={zoomScale => this.setState({zoomScale})}
        onMove={zoomOffset => this.setState({zoomOffset})}
        disableZoom={disableZoom}
        disableMove={disableMove}
      />
    );
  }
}
