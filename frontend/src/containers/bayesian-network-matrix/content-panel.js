import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  getContentPanelHeight,
  getLeftSubPanelWidth
} from '../../selectors/base';
import {
  getMatrixLayout,
  getMatrixCellSize,
  getMatrixPaddings
} from '../../selectors/data';
import DeckGLContainer from './deckgl-container';
const mapDispatchToProps = {};

const mapStateToProps = state => ({
  width: getLeftSubPanelWidth(state),
  height: getContentPanelHeight(state),
  matrix: getMatrixLayout(state),
  cellSize: getMatrixCellSize(state),
  paddings: getMatrixPaddings(state)
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
