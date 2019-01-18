import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {
  getShowFeatureDistributionWindow,
  getFeatureDistributionWindowSize
} from '../../selectors/base';
import {
  getRawSelectedNormalizedFeatureDistributionMap,
  getFeatureDistributionHistogramContainerWidth,
  getFeatureDistributionHistogramContainerHeight,
  getFeatureDistributionHistogramLayouts,
  getFeatureDistributionHistogramCoordinateInverter
} from '../../selectors/data';
import {
  updateShowFeatureDistributionWindow,
  updateFeatureDistributionWindowSize
} from '../../actions';

const mapDispatchToProps = {
  updateShowFeatureDistributionWindow,
  updateFeatureDistributionWindowSize
};

const mapStateToProps = state => ({
  showFeatureDistributionWindow: getShowFeatureDistributionWindow(state),
  featureDistributionWindowSize: getFeatureDistributionWindowSize(state),
  containerWidth: getFeatureDistributionHistogramContainerWidth(state),
  containerHeight: getFeatureDistributionHistogramContainerHeight(state),
  histogramLayouts: getFeatureDistributionHistogramLayouts(state),
  coordinateInverter: getFeatureDistributionHistogramCoordinateInverter(state)
});

class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sv: null,
      brush: null
    };
  }
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };
  _handleMouseDown = event => {
    if (event.button === 0) {
      const {coordinateInverter} = this.props;
      const [x, y] = this._getEventMouse(event);
      const sv = coordinateInverter(x, y);
      if (sv && sv.onPlot) {
        this.setState({
          sv,
          brush: null
        });
      }
    }
  };
  _handleMouseMove = event => {
    if (event.button === 0 && this.state.sv) {
      const {coordinateInverter} = this.props;
      const [x, y] = this._getEventMouse(event);
      const v = coordinateInverter(x, y);
      const {sv} = this.state;
      if (v && v.id === sv.id && v.onPlot) {
        this.setState({
          brush:
            x < sv.x ? [[x, sv.yt], [sv.x, sv.yb]] : [[sv.x, sv.yt], [x, sv.yb]]
        });
      } else if (x !== sv.x) {
        this.setState({
          brush:
            x < sv.x
              ? [[sv.xl, sv.yt], [sv.x, sv.yb]]
              : [[sv.x, sv.yt], [sv.xr, sv.yb]]
        });
      }
    }
  };
  _handleMouseUp = event => {
    if (event.button === 0) {
      this.setState({
        sv: null
      });
    }
  };
  _renderBrush() {
    const {brush} = this.state;
    if (brush) {
      const [[x0, y0], [x1, y1]] = brush;
      return (
        <div
          style={{
            border: '1px solid purple',
            position: 'absolute',
            left: x0,
            top: y0,
            width: x1 - x0,
            height: y1 - y0
          }}
        />
      );
    }
    return null;
  }
  render() {
    const {
      showFeatureDistributionWindow,
      featureDistributionWindowSize: [width, height],
      containerWidth,
      containerHeight
    } = this.props;
    const {brush} = this.state;
    return (
      showFeatureDistributionWindow && (
        <PopupWindow
          x={300}
          y={800}
          size={{width, height}}
          style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
          onResize={(event, {width, height}) => {
            this.props.updateFeatureDistributionWindowSize([width, height]);
          }}
          onClose={() => this.props.updateShowFeatureDistributionWindow(false)}
        >
          <div
            ref={input => (this.container = input)}
            style={{width: containerWidth, height: containerHeight}}
            onMouseDown={this._handleMouseDown}
            onMouseMove={this._handleMouseMove}
            onMouseUp={this._handleMouseUp}
          >
            <DeckGLContainer {...this.props} />
            {this._renderBrush()}
          </div>
        </PopupWindow>
      )
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
