import React, {PureComponent} from 'react';
import DeckGL, {
  OrthographicView,
  ScatterplotLayer,
  PolygonLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import {format} from 'd3-format';
import {AxisLayer} from '../../components/deckgl-layers';

import {DISTRIBUTION_SCATTERPLOT} from '../../constants';

const ID = 'bayesian-network-pair-distribution';

export default class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
  }
  _renderScatterplots() {
    const {scatterplotLayouts} = this.props;
    return scatterplotLayouts.map(({id, points, size: [w, h]}) => {
      return new ScatterplotLayer({
        id: ID + '-scatterplot-' + id,
        data: points,
        getRadius: 2,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      });
    });
  }
  _renderBorders() {
    const {scatterplotLayouts} = this.props;
    return scatterplotLayouts.map(({id, position: [x, y], size: [w, h]}) => {
      return new PolygonLayer({
        id: ID + '-scatterplot-background-' + id,
        data: [
          {
            polygon: [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]
          }
        ],
        filled: false,
        stroked: true,
        getLineColor: [0, 0, 0, 255],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      });
    });
  }
  _renderAxes() {
    const {
      AXIS_OFFSETS: [ax, ay]
    } = DISTRIBUTION_SCATTERPLOT;
    const {scatterplotLayouts} = this.props;
    const yAxes = scatterplotLayouts.map(
      ({id, position: [x, y], size: [w, h], source}) => {
        return new AxisLayer({
          id: ID + '-scatterplot-y-axis-' + id,
          origin: [x + ax, y + h - ay, 0],
          direction: [0, -1, 0],
          length: h - ay,
          domain: [0, 1],
          tickProps: {
            direction: [-1, 0, 0]
          },
          labelProps: {
            getSize: 10,
            offsetDirection: [-1, 0, 0],
            format: '.1f'
          },
          titleProps: {
            title: source,
            xOffset: 15,
            yOffset: h / 2,
            getSize: 10
          },
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY
        });
      }
    );
    const xAxes = scatterplotLayouts.map(
      ({id, position: [x, y], size: [w, h], target}) => {
        return new AxisLayer({
          id: ID + '-scatterplot-x-axis-' + id,
          origin: [x + ax, y + h - ay, 0],
          length: w - ax,
          domain: [0, 1],
          labelProps: {
            getSize: 10,
            format: '.1f'
          },
          titleProps: {
            title: target,
            xOffset: w / 2,
            yOffset: 15,
            getSize: 10
          },
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY
        });
      }
    );
    return [...xAxes, ...yAxes];
  }
  _renderLayers() {
    return [
      ...this._renderBorders(),
      ...this._renderScatterplots(),
      ...this._renderAxes()
    ];
  }
  render() {
    const {containerWidth: width, containerHeight: height} = this.props;
    const views = [
      new OrthographicView({
        right: width,
        bottom: height,
        top: 0,
        left: 0,
        width,
        height
      })
    ];
    return (
      <DeckGL
        width={width}
        height={height}
        views={views}
        layers={this._renderLayers()}
      />
    );
  }
}
