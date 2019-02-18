import React, {PureComponent} from 'react';
import DeckGL, {PolygonLayer} from 'deck.gl';
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
  _renderLayers() {
    return [];
  }
  render() {
    console.log('MAPBOX_TOKEN', MAPBOX_TOKEN);
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
