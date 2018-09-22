import {COORDINATE_SYSTEM, CompositeLayer} from 'deck.gl';
import {LineLayer} from 'deck.gl';
import {getCurvePoints} from 'cardinal-spline-js';
export const functor = v => (typeof v === 'function' ? v : () => v);

/* Constants */
const defaultProps = {
  id: 'spline-layer',
  getData: d => d.points,
  getAngle: x => 0,
  fontSize: 24,
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  fp64: false
};

export default class SplineLayer extends CompositeLayer {
  static layerName = 'SplineLayer';

  initializeState() {
    this.state = {typedEdgeData: []};
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.dataChanged || changeFlags.propsChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    if (changeFlags.dataChanged || changeFlags.propsChanged) {
      this.updateSplineData(props);
    }
  }
  getPickingInfo({info}) {
    info.object = info.object && info.object.data;
    return info;
  }
  updateSplineData() {
    const {data} = this.props;
    const paths = data.reduce((res, d) => {
      const sourcePosition = this.props.getSourcePosition(d);
      const targetPosition = this.props.getTargetPosition(d);
      const controlPoints = this.props.getControlPoints(d);

      // Catmull-Rom curve
      const serializedControlPoints = controlPoints.toString().split(',');
      const path = getCurvePoints(
        [...sourcePosition, ...serializedControlPoints, ...targetPosition],
        0.5,
        10
      );
      for (var i = 0, l = path.length - 2; i < l; i += 2) {
        res.push({
          source: [path[i], path[i + 1]],
          target: [path[i + 2], path[i + 3]],
          data: d
        });
      }
      return res;
    }, []);
    this.setState({paths});
  }

  renderLayers() {
    const {
      coordinateSystem,
      getColor,
      getStrokeWidth,
      id,
      updateTriggers,
      pickable
    } = this.props;
    const {paths} = this.state;
    const _getColor = functor(getColor);
    return new LineLayer({
      id: `${id}-splines`,
      data: paths,
      getSourcePosition: e => e.source,
      getTargetPosition: e => e.target,
      getColor: ({data}) => _getColor(data),
      getStrokeWidth,
      coordinateSystem,
      updateTriggers,
      pickable
    });
  }
}

SplineLayer.layerName = 'SplineLayer';
SplineLayer.defaultProps = defaultProps;
