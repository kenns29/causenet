import {ScatterplotLayer, CompositeLayer, COORDINATE_SYSTEM} from 'deck.gl';

const defaultProps = {
  id: 'stroked-scatter-plot-layer',
  data: [],
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  getPosition: d => d.position,
  getStrokeColor: () => [0, 0, 0, 255],
  strokeWidth: 1,
  getFillColor: () => [0, 0, 0, 255],
  getRadius: 1,
  updateTriggers: {}
};

const copyUpdateTriggers = updateTriggers =>
  Object.entries(updateTriggers).reduce(
    (obj, [key, value]) =>
      key !== 'getFillColor' && key !== 'getStrokeColor'
        ? Object.assign(obj, {[key]: value})
        : obj,
    {}
  );

export default class StrokedScatterplotLayer extends CompositeLayer {
  _renderFill() {
    const {
      id,
      data,
      coordinateSystem,
      getPosition,
      getFillColor,
      getRadius,
      updateTriggers
    } = this.props;

    return new ScatterplotLayer({
      id: id + '-fill',
      data,
      coordinateSystem,
      getColor: getFillColor,
      getPosition,
      getRadius,
      updateTriggers: {
        ...copyUpdateTriggers(updateTriggers),
        getColor: updateTriggers.getFillColor
      }
    });
  }
  _renderStroke() {
    const {
      id,
      data,
      coordinateSystem,
      getPosition,
      getStrokeColor,
      strokeWidth,
      getRadius,
      updateTriggers
    } = this.props;
    return new ScatterplotLayer({
      id: id + '-stroke',
      data,
      coordinateSystem,
      outline: true,
      getColor: getStrokeColor,
      getRadius,
      getPosition,
      strokeWidth,
      updateTriggers: {
        ...copyUpdateTriggers(updateTriggers),
        getColor: updateTriggers.getStrokeColor
      }
    });
  }
  renderLayers() {
    return [this._renderFill(), this._renderStroke()];
  }
}

StrokedScatterplotLayer.defaultProps = defaultProps;
StrokedScatterplotLayer.layerName = 'StrokedScatterplotLayer';
