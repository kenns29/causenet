import {CompositeLayer, LineLayer, TextLayer} from 'deck.gl';
import * as d3Scale from 'd3-scale';
import * as d3Format from 'd3-format';

const DEFAULT_LENGTH = 100;
const defaultProps = {
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  length: DEFAULT_LENGTH,
  numTicks: 10,
  ticks: null,
  domain: [0, 100],
  lineProps: {},
  tickProps: {
    len: 5,
    direction: [0, 1, 0]
  },
  labelProps: {
    offset: 10,
    offsetDirection: [0, 1, 0],
    format: 'd'
  },
  titleProps: {
    title: 'axis',
    xOffset: DEFAULT_LENGTH / 2,
    yOffset: 15,
    zOffset: 0
  }
};

const getDirInfo = direction => {
  return direction.reduce(
    ({sign, index}, n, idx) => {
      const s = Math.sign(n);
      return s ? {sign: s, index: idx} : {sign, index};
    },
    {sign: 1, index: 0}
  );
};
export default class AxisLayer extends CompositeLayer {
  _renderLine() {
    const {
      id,
      origin,
      direction,
      length,
      lineProps,
      coordinateSystem
    } = this.props;
    const {sign, index} = getDirInfo(direction);
    const sourcePosition = [...origin];
    const targetPosition = [...origin];
    targetPosition[index] += sign * length;
    return [
      new LineLayer({
        ...lineProps,
        id: id + '-line-layer',
        data: [
          {
            sourcePosition,
            targetPosition
          }
        ],
        coordinateSystem
      })
    ];
  }
  _renderTicks(ticks) {
    const {tickProps: defaultTickProps} = defaultProps;
    const {id, tickProps, coordinateSystem} = this.props;
    const props = {...defaultTickProps, ...tickProps};
    const {direction, len} = props;
    const {sign, index} = getDirInfo(direction);
    return [
      new LineLayer({
        ...tickProps,
        id: id + '-tick-layer',
        data: ticks.map(d => {
          const {position} = d;
          const sourcePosition = [...position];
          const targetPosition = [...position];
          targetPosition[index] += sign * len;
          return {
            sourcePosition,
            targetPosition
          };
        }),
        coordinateSystem
      })
    ];
  }
  _renderLabels(ticks) {
    const {labelProps: defaultLabelProps} = defaultProps;
    const {id, labelProps, coordinateSystem} = this.props;
    const props = {...defaultLabelProps, ...labelProps};
    const {offset, offsetDirection, format} = props;
    const {sign, index} = getDirInfo(offsetDirection);
    return [
      new TextLayer({
        ...labelProps,
        id: id + '-label-layer',
        data: ticks,
        getPosition: d => {
          const position = [...d.position];
          position[index] += sign * offset;
          return position;
        },
        getText: d => d3Format.format(format)(d.value),
        coordinateSystem
      })
    ];
  }
  _renderTitle() {
    const {titleProps: defaultTitleProps} = defaultProps;
    const {id, titleProps, coordinateSystem, origin} = this.props;
    const props = {...defaultTitleProps, ...titleProps};
    const {xOffset, yOffset, zOffset, title} = props;
    return [
      new TextLayer({
        ...titleProps,
        id: id + '-title-layer',
        data: [title],
        getText: d => d,
        getPosition: d => {
          const position = [...origin];
          position[0] += xOffset;
          position[1] += yOffset;
          position[2] += zOffset;
          return position;
        },
        coordinateSystem
      })
    ];
  }
  _calcTicks() {
    const {domain, origin, direction, length, numTicks, ticks} = this.props;
    const scale = d3Scale
      .scaleLinear()
      .domain(domain)
      .range([0, length]);
    const {sign, index} = getDirInfo(direction);
    return (ticks ? ticks : scale.ticks(numTicks)).map(value => {
      const offset = scale(value);
      const position = [...origin];
      position[index] += sign * offset;
      return {
        value,
        offset,
        position
      };
    });
  }
  renderLayers() {
    const ticks = this._calcTicks();
    return [
      ...this._renderLine(),
      ...this._renderTicks(ticks),
      ...this._renderLabels(ticks),
      ...this._renderTitle()
    ];
  }
}
AxisLayer.defaultProps = defaultProps;
AxisLayer.layerName = 'AxisLayer';
