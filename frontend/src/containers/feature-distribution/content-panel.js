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
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };
  _handleMouseDown = event => {
    const {coordinateInverter} = this.props;
    if (event.button === 0) {
      const [x, y] = this._getEventMouse(event);
      const inv = coordinateInverter(x, y);
      if (inv) {
        const {onPlot} = inv;
      }
    }
  };
  _handleMouseMove = event => {};
  _handleMouseUp = event => {};
  render() {
    const {
      showFeatureDistributionWindow,
      featureDistributionWindowSize: [width, height],
      containerWidth,
      containerHeight
    } = this.props;
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
