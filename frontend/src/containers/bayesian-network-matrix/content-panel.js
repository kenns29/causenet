import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  getMatrixLayout,
  getMatrixCellSize,
  getMatrixPaddings,
  getHighlightedBayesianNetworkEdge
} from '../../selectors/data';
import {updateHighlightedBayesianNetworkEdge} from '../../actions';
import DeckGLContainer from './deckgl-container';

const mapDispatchToProps = {updateHighlightedBayesianNetworkEdge};

const mapStateToProps = state => ({
  matrix: getMatrixLayout(state),
  cellSize: getMatrixCellSize(state),
  paddings: getMatrixPaddings(state),
  highlightedEdge: getHighlightedBayesianNetworkEdge(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }

  render() {
    const {width, height} = this.props;
    return (
      <div style={this.containerStyle} width={width} height={height}>
        <DeckGLContainer {...this.props} />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
