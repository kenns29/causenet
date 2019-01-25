import React, {PureComponent} from 'react';
import DeckGL, {
  OrthographicView,
  PolygonLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import {AxisLayer} from '../../components/deckgl-layers';
import {FEATURE_DISTRIBUTION_HISTOGRAM} from '../../constants';

const ID = 'feature-distribution-histogram';

export default class Content extends PureComponent {
  constructor(props) {
    super(props);
  }
  _renderBorders() {
    const {histogramLayouts} = this.props;
    return histogramLayouts.map(({id, position: [x, y], size: [w, h]}) => {
      return new PolygonLayer({
        id: ID + '-background-' + id,
        data: [
          {polygon: [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]}
        ],
        filled: false,
        stroked: true,
        getLineColor: [64, 64, 64, 255],
        getLineWidth: 1,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      });
    });
  }
  _renderBins() {
    const {histogramLayouts} = this.props;
    return histogramLayouts.map(({id, bins}) => {
      return new PolygonLayer({
        id: ID + '-bins-' + id,
        data: bins,
        filled: true,
        stroked: true,
        getPolygon: d => d.polygon,
        getFillColor: [64, 64, 64, 255],
        getLineColor: [255, 255, 255, 255],
        getLineWidth: 1,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY
      });
    });
  }
  _renderAxes() {
    const {
      MARGIN: [ml, mt, mr, mb],
      AXIS_OFFSETS: [ax, ay]
    } = FEATURE_DISTRIBUTION_HISTOGRAM;
    const {histogramLayouts} = this.props;
    const yAxes = histogramLayouts.map(
      ({id, label, position: [x, y], size: [w, h], bins}) => {
        const max = bins.reduce((m, {size}) => Math.max(m, size), 0);
        return new AxisLayer({
          id: ID + '-y-axis-' + id,
          origin: [x + ml + ax - 2, y + h - mb - ay, 0],
          direction: [0, -1, 0],
          length: h - ay - mt - mb,
          domain: [0, max],
          tickProps: {
            direction: [-1, 0, 0]
          },
          labelProps: {
            offset: 10,
            getSize: 10,
            offsetDirection: [-1, 0, 0],
            format: '.1f',
            getTextAnchor: 'end'
          },
          titleProps: {
            title: label.slice(0, 20),
            xOffset: -35,
            yOffset: -h / 2 + ay,
            getSize: 10,
            getAngle: 90
          },
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY
        });
      }
    );
    const xAxes = histogramLayouts.map(
      ({id, label, position: [x, y], size: [w, h]}) => {
        return new AxisLayer({
          id: ID + '-x-axis-' + id,
          origin: [x + ml + ax, y + h - mb - ay + 2, 0],
          length: w - ax - ml - mr,
          domain: [0, 1],
          labelProps: {
            getSize: 10,
            format: '.1f',
            getAlignmentBaseline: 'top'
          },
          titleProps: {
            title: label.slice(0, 20),
            xOffset: w / 2 - ax,
            yOffset: 30,
            getSize: 10
          },
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY
        });
      }
    );
    return [...yAxes, ...xAxes];
  }
  _renderLayers() {
    return [
      ...this._renderAxes(),
      // ...this._renderBorders(),
      ...this._renderBins()
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
