import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DeckGLContainer from './deckgl-container';
import {
  getClusteringMatrixLayout,
  getClusteringMatrixCellSize,
  getClusteringMatrixPaddings
} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
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
    return (
      <div style={this.containerStyle}>
        {this.props.matrix && <DeckGLContainer {...this.props} />}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
