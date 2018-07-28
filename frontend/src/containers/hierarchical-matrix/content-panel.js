import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DeckGLContainer from './deckgl-container';
import {
  getClusteringMatrixLayout,
  getHierarchicalClusteringVerticalTreeLayout,
  getHierarchicalClusteringHorizontalTreeLayout,
  getClusteringMatrixCellSize,
  getClusteringMatrixPaddings
} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  colTree: getHierarchicalClusteringVerticalTreeLayout(state),
  rowTree: getHierarchicalClusteringHorizontalTreeLayout(state),
  matrix: getClusteringMatrixLayout(state),
  cellSize: getClusteringMatrixCellSize(state),
  paddings: getClusteringMatrixPaddings(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    const {width, height} = this.props;
    return {
      position: 'relative',
      width,
      height
    };
  }

  render() {
    const {matrix, colTree, rowTree} = this.props;
    return (
      <div style={this.containerStyle}>
        {matrix && colTree && rowTree && <DeckGLContainer {...this.props} />}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
