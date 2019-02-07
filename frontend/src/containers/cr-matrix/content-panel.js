import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {
  getShowCrMatrixWindow,
  getCrMatrixWindowSize
} from '../../selectors/base';
import {
  getRelationMatrixCellSize,
  getRelationMatrixLayout,
  getCrRowBayesianNetworkLayout
} from '../../selectors/data';
import {
  updateShowCrMatrixWindow,
  updateCrMatrixWindowSize
} from '../../actions';

const mapDispatchToProps = {
  updateShowCrMatrixWindow,
  updateCrMatrixWindowSize
};

const mapStateToProps = state => ({
  showWindow: getShowCrMatrixWindow(state),
  windowSize: getCrMatrixWindowSize(state),
  matrix: getRelationMatrixLayout(state),
  cellSize: getRelationMatrixCellSize(state),
  rowNetwork: getCrRowBayesianNetworkLayout(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {
      showWindow,
      windowSize: [width, height]
    } = this.props;
    return (
      showWindow && (
        <PopupWindow
          x={600}
          y={50}
          width={width}
          height={height}
          style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
          onResize={(event, {width, height}) => {
            this.props.updateCrMatrixWindowSize([width, height]);
          }}
          onClose={() => this.props.updateShowCrMatrixWindow(false)}
        >
          <DeckGLContainer {...this.props} width={width} height={height - 20} />
        </PopupWindow>
      )
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
