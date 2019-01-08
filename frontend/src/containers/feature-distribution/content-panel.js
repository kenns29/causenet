import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import {
  getShowFeatureDistributionWindow,
  getFeatureDistributionWindowSize
} from '../../selectors/base';
import {
  getRawSelectedNormalizedFeatureDistributionMap,
  getFeatureDistributionHistogramContainerWidth,
  getFeatureDistributionHistogramContainerHeight
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
  containerHeight: getFeatureDistributionHistogramContainerHeight(state)
});

class ContentPanel extends PureComponent {
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
          <div style={{width: containerWidth, height: containerHeight}} />
        </PopupWindow>
      )
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
