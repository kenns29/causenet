import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

export default class ZoomableContainer extends PureComponent {
  static defaultProps = {
    zoomStep: 0.1,
    width: 0,
    height: 0,
    disableZoom: false,
    disableMove: false
  };

  static propTypes = {
    zoomStep: PropTypes.number.isRequired,
    viewBox: PropTypes.arrayOf(PropTypes.number),
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    disableZoom: PropTypes.bool.isRequired,
    disableMove: PropTypes.bool.isRequired
  };

  static getDerivedStateFromProps(props, state) {
    const {viewBox} = state;
    if (!viewBox) {
      const {width, height} = props;
      return {...state, viewBox: [0, 0, width, height]};
    }
    return state;
  }

  constructor(props) {
    super(props);
    this.state = {
      drag: {
        move: null // drag start mouse position - [x, y]
      },
      viewBox: null
    };
  }
  // obtain the event mouse position relative to the current context (the svg)
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };

  _zoomIn = event => {
    const {width, height, zoomStep} = this.props;
    const {
      viewBox: [l, t, w, h]
    } = this.state;
    const [nw, nh] = [w * (1 - zoomStep), h * (1 - zoomStep)];
    const [nl, nt] = [l + (w - nw) / 2, t + (h - nh) / 2];
    this.setState({viewBox: [nl, nt, nw, nh]});
  };

  _zoomOut = event => {
    const {width, height, zoomStep} = this.props;
    const {
      viewBox: [l, t, w, h]
    } = this.state;
    const [nw, nh] = [w * (1 + zoomStep), h * (1 + zoomStep)];
    const [nl, nt] = [l + (w - nw) / 2, t + (h - nh) / 2];
    this.setState({viewBox: [nl, nt, nw, nh]});
  };

  _moveStart = event => {
    const [x, y] = this._getEventMouse(event);
    this.setState({drag: {...this.state.drag, move: [x, y]}});
  };

  _moveOn = event => {
    if (this.state.drag.move) {
      const {
        viewBox: [l, t, w, h]
      } = this.state;
      const [x, y] = this._getEventMouse(event);
      const [sx, sy] = this.state.drag.move;
      const [dx, dy] = [sx - x, sy - y];
      this.setState({
        drag: {...this.state.drag, move: [x, y]},
        viewBox: [l + dx, t + dy, w, h]
      });
    }
  };

  _moveEnd = () => {
    this.setState({drag: {...this.state.drag, move: null}});
  };

  _handleWheel = event => {
    if (!this.props.disableZoom) {
      if (event.deltaY < 0) {
        this._zoomIn(event);
      } else {
        this._zoomOut(event);
      }
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
    const {width, height} = this.props;
    const {
      viewBox: [l, t, w, h]
    } = this.state;
    return (
      <svg
        viewBox={`${l} ${t} ${w} ${h}`}
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
