import React, {PureComponent} from 'react';
import DeckGL, {
  OrthographicView,
  PolygonLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import {AxisLayer} from '../../components/deckgl-layers';

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
  _renderLayers() {
    return [...this._renderBorders(), ...this._renderBins()];
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
