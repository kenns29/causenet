import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  getContentPanelWidth,
  getContentPanelHeight
} from '../../selectors/base';
import {getMatrixLayout, getMatrixCellSize} from '../../selectors/data';
import DeckGLContainer from './deckgl-container';
const mapDispatchToProps = {};

const mapStateToProps = state => ({
  width: getContentPanelWidth(state),
  height: getContentPanelHeight(state),
  matrix: getMatrixLayout(state),
  cellSize: getMatrixCellSize(state)
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
