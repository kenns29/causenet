import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

const isNull = v => v === null || v === undefined;

export default class ZoomableContainer extends PureComponent {
  static defaultProps = {
    zoomStep: 0.1,
    width: 0,
    height: 0,
    onZoom: () => {},
    onMove: () => {},
    disableZoom: false,
    disableMove: false
  };

  static propTypes = {
    zoomStep: PropTypes.number.isRequired,
    top: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onZoom: PropTypes.func.isRequired, // callback function after zoom is triggered
    onMove: PropTypes.func.isRequired, // callback function after pan is triggered,
    disableZoom: PropTypes.bool.isRequired,
    disableMove: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      zoomScale: 1, // zoomScale < 1 for zoom in, zoomScale > 1 for zoom out
      zoomOffset: [0, 0], // the panning offset -- [x offset, y offset]
      drag: {
        move: null // drag start mouse position - [x, y]
      }
    };
  }
  // obtain the event mouse position relative to the current context (the svg)
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };

  _zoomIn = () => {
    const zoomScale = Math.max(
      0.001,
      this.state.zoomScale - this.props.zoomStep
    );
    this.setState({
      zoomScale
    });
    return zoomScale;
  };

  _zoomOut = () => {
    const zoomScale = Math.min(100, this.state.zoomScale + this.props.zoomStep);
    this.setState({
      zoomScale
    });
    return zoomScale;
  };

  _moveStart = event => {
    const [x, y] = this._getEventMouse(event);
    this.setState({drag: {...this.state.drag, move: [x, y]}});
  };

  _moveOn = event => {
    if (this.state.drag.move) {
      const [x, y] = this._getEventMouse(event);
      const [sx, sy] = this.state.drag.move;
      const [ox, oy] = this.state.zoomOffset;
      const [dx, dy] = [ox + sx - x, oy + sy - y];
      this.setState({
        zoomOffset: [dx, dy],
        drag: {...this.state.drag, move: [x, y]}
      });
      this.props.onMove([dx, dy], event);
    }
  };

  _moveEnd = () => {
    this.setState({drag: {...this.state.drag, move: null}});
  };

  _handleWheel = event => {
    if (!this.props.disableZoom) {
      let zoomScale;
      if (event.deltaY < 0) {
        zoomScale = this._zoomIn(event);
      } else {
        zoomScale = this._zoomOut(event);
      }
      this.props.onZoom(zoomScale, event);
    }
  };

  _handleMouseDown = event => {
    if (event.button === 0 && !this.props.disableMove) {
      this._moveStart(event);
    }
  };

  _handleMouseMove = event => {
    if (!this.props.disableMove) {
      this._moveOn(event);
    }
  };

  _handleMouseUp = event => {
    if (event.button === 0) {
      this._moveEnd();
    }
  };

  render() {
    const {left, right, bottom, top, width, height} = this.props;
    const {
      zoomScale,
      zoomOffset: [dx, dy]
    } = this.state;

    let l = isNull(left) ? 0 : left;
    let r = isNull(right) ? width : right;
    let b = isNull(bottom) ? height : bottom;
    let t = isNull(top) ? 0 : top;

    l += dx * zoomScale + (r - l) * (1 - zoomScale) * 0.5;
    r += dx * zoomScale - (r - l) * (1 - zoomScale) * 0.5;
    b += dy * zoomScale - (b - t) * (1 - zoomScale) * 0.5;
    t += dy * zoomScale + (b - t) * (1 - zoomScale) * 0.5;

    return (
      <svg
        viewBox={`${l} ${t} ${r} ${b}`}
        width={width}
        height={height}
        ref={input => (this.container = input)}
        onMouseDown={this._handleMouseDown}
        onMouseMove={this._handleMouseMove}
        onMouseUp={this._handleMouseUp}
        onWheel={this._handleWheel}
      >
        {this.props.children &&
          React.Children.map(
            this.props.children,
            child => child && React.cloneElement(child)
          )}
      </svg>
    );
  }
}
