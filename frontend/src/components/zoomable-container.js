import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import DeckGL, {OrthographicView, Layer} from 'deck.gl';
export default class ZoomableContainer extends PureComponent {
  static defaultProps = {
    zoomStep: 0.1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    layers: [],
    style: {},
    overlay: null,
    onZoom: () => {},
    onMove: () => {}
  };
  static propTypes = {
    zoomStep: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    layers: PropTypes.arrayOf(PropTypes.instanceOf(Layer)).isRequired,
    style: PropTypes.object.isRequired,
    getCursor: PropTypes.func,
    onZoom: PropTypes.func.isRequired, // callback function after zoom is triggered
    onMove: PropTypes.func.isRequired // callback function after pan is triggered
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
  // obtain the event mouse position relative to the current context (the div container)
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };
  _zoomIn = () => {
    this.setState({
      zoomScale: Math.max(0.001, this.state.zoomScale - this.props.zoomStep)
    });
  };
  _zoomOut = () => {
    this.setState({
      zoomScale: Math.min(100, this.state.zoomScale + this.props.zoomStep)
    });
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
    }
  };
  _moveEnd = () => {
    this.setState({drag: {...this.state.drag, move: null}});
  };
  _handleWheel = event => {
    if (event.deltaY < 0) {
      this._zoomIn();
    } else {
      this._zoomOut();
    }
  };
  _handleMouseDown = event => {
    this._moveStart(event);
  };
  _handleMouseMove = event => {
    this._moveOn(event);
  };
  _handleMouseUp = event => {
    this._moveEnd();
  };
  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.zoomScale !== prevState.zoomScale) {
      this.props.onZoom(this.state.zoomScale);
    }
    if (this.state.zoomOffset !== prevState.zoomOffset) {
      this.props.onMove(this.state.zoomOffset);
    }
  };
  render() {
    const {
      left,
      right,
      bottom,
      top,
      width,
      height,
      layers,
      style,
      getCursor,
      overlay
    } = this.props;
    const {
      zoomScale,
      zoomOffset: [dx, dy]
    } = this.state;
    const views = [
      new OrthographicView({
        left: left + dx * zoomScale + (right - left) * (1 - zoomScale) * 0.5,
        right: right + dx * zoomScale - (right - left) * (1 - zoomScale) * 0.5,
        bottom:
          bottom + dy * zoomScale - (bottom - top) * (1 - zoomScale) * 0.5,
        top: top + dy * zoomScale + (bottom - top) * (1 - zoomScale) * 0.5,
        width,
        height
      })
    ];
    return (
      <div
        ref={input => (this.container = input)}
        onMouseDown={this._handleMouseDown}
        onMouseMove={this._handleMouseMove}
        onMouseUp={this._handleMouseUp}
        onWheel={this._handleWheel}
      >
        <DeckGL
          ref={input => (this.deck = input)}
          width={width}
          height={height}
          views={views}
          layers={layers}
          style={style}
          getCursor={getCursor}
        >
          {this.props.children &&
            React.Children.map(
              this.props.children,
              child => child && React.cloneElement(child)
            )}
        </DeckGL>
        {overlay}
      </div>
    );
  }
}
