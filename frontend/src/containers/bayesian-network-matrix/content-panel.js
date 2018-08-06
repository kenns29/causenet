import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Spin} from 'antd';
import {
  getMatrixLayout,
  getMatrixCellSize,
  getMatrixPaddings,
  getHighlightedBayesianNetworkEdge,
  getIsFetchingModifiedBayesianNetwork
} from '../../selectors/data';
import {updateHighlightedBayesianNetworkEdge} from '../../actions';
import DeckGLContainer from './deckgl-container';

const mapDispatchToProps = {updateHighlightedBayesianNetworkEdge};

const mapStateToProps = state => ({
  matrix: getMatrixLayout(state),
  cellSize: getMatrixCellSize(state),
  paddings: getMatrixPaddings(state),
  highlightedEdge: getHighlightedBayesianNetworkEdge(state),
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
