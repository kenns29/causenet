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
  getRawSelectedNormalizedFeatureDistributionMap
} from '../../selectors/data';
import {
  updateShowBayesianNetworkDistributionWindow,
  updateBayesianNetworkDistributionWindowSize
} from '../../actions';

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
  distributionFeaturePairs: getRawDistributionFeaturePairs(state),
  selectedNormalizedFeatureDistributionMap: getRawSelectedNormalizedFeatureDistributionMap(
    state
  )
});

class ContentPanel extends PureComponent {
  render() {
    const {
      showBayesianNetworkDistributionWindow,
      bayesianNetworkDistributionWindowSize: [width, height],
      distributionFeaturePairs,
      selectedNormalizedFeatureDistributionMap
    } = this.props;
    const scale = scaleLinear()
      .domain([0, 1])
      .range([0, 380]);
    const data = distributionFeaturePairs.map(pair => {
      const {source, target} = pair;
      const [sourceValues, targetValues] = [source, target].map(
        id => selectedNormalizedFeatureDistributionMap[id]
      );
      if ([sourceValues, targetValues].some(d => !d)) {
        return [];
      }
      const points = Object.keys(sourceValues).map(key => {
        const [sourceValue, targetValue] = [
          sourceValues[key],
          targetValues[key]
        ];
        let [x, y] = [sourceValue, 1 - targetValue].map(scale);
        x += 20;
        y += 20;
        return {
          key,
          source,
          target,
          values: [sourceValue, targetValue],
          position: [x, y]
        };
      });
      return points;
    });
    const d = data.length ? data[0] : [];
    return (
      showBayesianNetworkDistributionWindow && (
        <PopupWindow
          size={{width, height}}
          style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
          onResize={(event, {width, height}) =>
            this.props.updateBayesianNetworkDistributionWindowSize([
              width,
              height
            ])
          }
          onClose={() =>
            this.props.updateShowBayesianNetworkDistributionWindow(false)
          }
        >
          <DeckGLContainer {...this.props} data={d} />
        </PopupWindow>
      )
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
