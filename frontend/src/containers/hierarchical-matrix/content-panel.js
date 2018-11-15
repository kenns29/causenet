import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DeckGLContainer from './deckgl-container';
import {
  getClusteringMatrixLayout,
  getHierarchicalClusteringVerticalTreeLayout,
  getHierarchicalClusteringHorizontalTreeLayout,
  getClusteringMatrixCellSize,
  getClusteringMatrixPaddings,
  getRawFeatureSelection
} from '../../selectors/data';
import {requestToggleFeatureSelection} from '../../actions';

const mapDispatchToProps = {
  requestToggleFeatureSelection
};

const mapStateToProps = state => ({
  colTree: getHierarchicalClusteringVerticalTreeLayout(state),
  rowTree: getHierarchicalClusteringHorizontalTreeLayout(state),
  matrix: getClusteringMatrixLayout(state),
  cellSize: getClusteringMatrixCellSize(state),
  paddings: getClusteringMatrixPaddings(state),
  featureSelection: getRawFeatureSelection(state)
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
