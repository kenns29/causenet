import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {
  getShowCmMatrixWindow,
  getCmMatrixWindowSize
} from '../../selectors/base';
import {getCmMatrixLayout, getCmMatrixCellSize} from '../../selectors/data';
import {
  updateShowCmMatrixWindow,
  updateCmMatrixWindowSize
} from '../../actions';

const mapDispatchToProps = {updateShowCmMatrixWindow, updateCmMatrixWindowSize};

const mapStateToProps = state => ({
  showWindow: getShowCmMatrixWindow(state),
  windowSize: getCmMatrixWindowSize(state),
  matrix: getCmMatrixLayout(state),
  cellSize: getCmMatrixCellSize(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {
      showWindow,
      windowSize: [width, height]
    } = this.props;
    return showWindow ? (
      <PopupWindow
        ref={input => (this.container = input)}
        x={600}
        y={50}
        width={width}
        height={height}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onResize={(event, {width, height}) => {
          this.props.updateCmMatrixWindowSize([width, height]);
        }}
        onClose={() => this.props.updateShowCmMatrixWindow(false)}
      >
        <DeckGLContainer
          ref={input => {
            this.deckGLContainer = input;
          }}
          {...this.props}
          width={width}
          height={height - 20}
        />
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
