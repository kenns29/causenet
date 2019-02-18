import React, {PureComponent} from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import shape from '../../data/world.json';

const ID = 'world-map';

const MAPBOX_TOKEN = process.env.MapboxAccessToken;

const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

export default class ContentPanel extends PureComponent {
  _renderGeoJson() {
    return [
      new GeoJsonLayer({
        id: ID + '-geojson',
        data: shape,
        stroked: true,
        filled: false,
        getLineWidth: 10,
        lineWidthMinPixels: 1,
        getFillColor: [255, 255, 255],
        getLineColor: [0, 0, 0]
      })
    ];
  }
  _renderLayers() {
    return [this._renderGeoJson()];
  }
  render() {
    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        width="100%"
        height="100%"
        layers={this._renderLayers()}
      >
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
      </DeckGL>
    );
  }
}
