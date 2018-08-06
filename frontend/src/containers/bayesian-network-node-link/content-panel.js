import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Spin} from 'antd';
import {
  getDagLayout,
  getNodeLinkViewOptions,
  getHighlightedBayesianNetworkEdge,
  getHighlightedBayesianModelFeature,
  getIsFetchingModifiedBayesianNetwork
} from '../../selectors/data';
import DeckGLContainer from './deckgl-container';
import {
  updateHighlightedBayesianNetworkEdge,
  updateHighlightedBayesianModelFeature
} from '../../actions';

const mapDispatchToProps = {
  updateHighlightedBayesianNetworkEdge,
  updateHighlightedBayesianModelFeature
};

const mapStateToProps = state => ({
  data: getDagLayout(state),
  options: getNodeLinkViewOptions(state),
  highlightedEdge: getHighlightedBayesianNetworkEdge(state),
  highlightedFeature: getHighlightedBayesianModelFeature(state),
  isFetchingModifiedBayesianNetwork: getIsFetchingModifiedBayesianNetwork(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }

  render() {
    const {width, height, isFetchingModifiedBayesianNetwork} = this.props;
    return (
      <div style={this.containerStyle} width={width} height={height}>
        {isFetchingModifiedBayesianNetwork && (
          <Spin
            tip="loading..."
            size="large"
            style={{position: 'absolute', left: width / 2, top: height / 2}}
          />
        )}
        <DeckGLContainer {...this.props} />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
