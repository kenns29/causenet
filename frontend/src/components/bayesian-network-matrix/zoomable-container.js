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
    layers: []
  };
  static propTypes = {
    zoomStep: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    layers: PropTypes.arrayOf(PropTypes.instanceOf(Layer))
  };
  constructor(props) {
    super(props);
    this.state = {
      zoomScale: 1,
      zoomOffset: [0, 0]
    };
  }
  _zoomIn = () => {
    this.setState({
      zoomScale: Math.max(0.001, this.state.zoomScale - this.props.zoomStep)
    });
  };
  _zoomOut = () => {
    this.setState({
      zoomScale: Math.min(2.88, this.state.zoomScale + this.props.zoomStep)
    });
  };
  _move = (dx, dy) => {};
  _handleWheel = event => {
    const {deltaY} = event;
    if (deltaY < 0) {
      this._zoomIn();
    } else {
      this._zoomOut();
    }
  };
  render() {
    const {left, top, width, height, layers} = this.props;
    let {bottom, right} = this.props;
    bottom = bottom || height;
    right = right || width;
    const {
      zoomScale,
      zoomOffset: [dx, dy]
    } = this.state;
    const views = [
      new OrthographicView({
        left: left + dx + (right - left) * (1 - zoomScale) * 0.5,
        right: right + dx - (right - left) * (1 - zoomScale) * 0.5,
        bottom: bottom + dy - (bottom - top) * (1 - zoomScale) * 0.5,
        top: top + dy + (bottom - top) * (1 - zoomScale) * 0.5,
        width,
        height
      })
    ];
    return (
      <div onWheel={this._handleWheel}>
        <DeckGL width={width} height={height} views={views} layers={layers}>
          {this.props.children &&
            React.Children.map(
              this.props.children,
              child => child && React.cloneElement(child)
            )}
        </DeckGL>
      </div>
    );
  }
}
