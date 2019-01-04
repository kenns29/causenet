import React, {PureComponent} from 'react';
import DeckGL, {
  OrthographicView,
  ScatterplotLayer,
  PolygonLayer,
  COORDINATE_SYSTEM
} from 'deck.gl';
import {DISTRIBUTION_SCATTERPLOT} from '../../constants';

const ID = 'bayesian-network-pair-distribution';

export default class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
  }
  _renderScatterplots() {
    const {
      PADDING: [pl, pt, pr, pb],
      CONTAINER_MARGIN: [ml, mt, mr, mb]
    } = DISTRIBUTION_SCATTERPLOT;
    const {scatterplotLayouts} = this.props;
    const scatterplots = scatterplotLayouts.map(
      ({id, points, size: [w, h]}) => {
        return new ScatterplotLayer({
          id: ID + '-scatterplot-' + id,
          data: points,
          getRadius: 2,
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY
        });
      }
    );
    const borders = scatterplotLayouts.map(
      ({id, position: [px, py], size: [w, h]}) => {
        return new PolygonLayer({
          id: ID + '-scatterplot-background-' + id,
          data: [
            {
              polygon: [
                [px, py],
                [px + w, py],
                [px + w, py + h],
                [px, py + h],
                [px, py]
              ]
            }
          ],
          filled: false,
          stroked: true,
          getLineColor: [0, 0, 0, 255],
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY
        });
      }
    );
    return [...borders, ...scatterplots];
  }
  _renderLayers() {
    return [...this._renderScatterplots()];
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
