import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {
  getShowBayesianNetworkDistributionWindow,
  getBayesianNetworkDistributionWindowSize
} from '../../selectors/base';
import {
  getRawDistributionFeaturePairs,
  getRawSelectedNormalizedFeatureDistributionMap,
  getPairDistributionScatterplotContainerWidth,
  getPairDistributionScatterplotContainerHeight,
  getPairDistributionScatterplotLayouts
} from '../../selectors/data';
import {
  updateShowBayesianNetworkDistributionWindow,
  updateBayesianNetworkDistributionWindowSize
} from '../../actions';
import {DISTRIBUTION_SCATTERPLOT} from '../../constants';

import {scaleLinear} from 'd3-scale';

const mapDispatchToProps = {
  updateShowBayesianNetworkDistributionWindow,
  updateBayesianNetworkDistributionWindowSize
};

const mapStateToProps = state => ({
  showBayesianNetworkDistributionWindow: getShowBayesianNetworkDistributionWindow(
    state
  ),
  bayesianNetworkDistributionWindowSize: getBayesianNetworkDistributionWindowSize(
    state
  ),
  containerWidth: getPairDistributionScatterplotContainerWidth(state),
  containerHeight: getPairDistributionScatterplotContainerHeight(state),
  scatterplotLayouts: getPairDistributionScatterplotLayouts(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {
      showBayesianNetworkDistributionWindow,
      bayesianNetworkDistributionWindowSize: [width, height],
      containerWidth,
      containerHeight
    } = this.props;
    return (
      showBayesianNetworkDistributionWindow && (
        <PopupWindow
          size={{width, height}}
          style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
          onResize={(event, {width, height}) => {
            this.props.updateBayesianNetworkDistributionWindowSize([
              width,
              height
            ]);
          }}
          onClose={() =>
            this.props.updateShowBayesianNetworkDistributionWindow(false)
          }
        >
          <div style={{width: containerWidth, height: containerHeight}}>
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