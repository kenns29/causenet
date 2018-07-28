import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DeckGLContainer from './deckgl-container';
import {
  getClusteringMatrixLayout,
  getHierarchicalClusteringVerticalTreeLayout,
  getClusteringMatrixCellSize,
  getClusteringMatrixPaddings
} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  colTree: getHierarchicalClusteringVerticalTreeLayout(state),
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
    const {matrix, colTree} = this.props;
    return (
      <div style={this.containerStyle}>
        {matrix && colTree && <DeckGLContainer {...this.props} />}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
