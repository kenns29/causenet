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
  getCrRowBayesianNetworkLayout,
  getCrColBayesianNetworkLayout,
  getCrCrossBayesianNetworkLayout,
  getRawCrMatrixOptions,
  getRawCrMatrixFocus
} from '../../selectors/data';
import {
  updateShowCrMatrixWindow,
  updateCrMatrixWindowSize,
  updateCrMatrixFocus
} from '../../actions';

const mapDispatchToProps = {
  updateShowCrMatrixWindow,
  updateCrMatrixWindowSize,
  updateCrMatrixFocus
};

const mapStateToProps = state => ({
  showWindow: getShowCrMatrixWindow(state),
  windowSize: getCrMatrixWindowSize(state),
  matrix: getRelationMatrixLayout(state),
  cellSize: getRelationMatrixCellSize(state),
  rowNetwork: getCrRowBayesianNetworkLayout(state),
  colNetwork: getCrColBayesianNetworkLayout(state),
  crossNetwork: getCrCrossBayesianNetworkLayout(state),
  options: getRawCrMatrixOptions(state),
  focus: getRawCrMatrixFocus(state)
});

class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      getCursor: () => 'auto'
    };
  }
  _getDeck = () =>
    this.deckGLContainer &&
    this.deckGLContainer.container &&
    this.deckGLContainer.container.deck &&
    this.deckGLContainer.container.deck.deck;

  _pickObject = param => {
    const deck = this._getDeck();
    return deck && deck.pickObject(param);
  };

  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.contentContainer.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };

  _handleMouseMove = event => {
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({
        x,
        y
      });

      if (info) {
        const {layer} = info;
        if (
          layer.id.startsWith('cr-matrix-y-axis') ||
          layer.id.startsWith('cr-matrix-x-axis')
        ) {
          this.setState({
            getCursor: () => 'pointer'
          });
        } else {
          this.setState({getCursor: () => 'auto'});
        }
      } else {
        this.setState({getCursor: () => 'auto'});
      }
    }
  };

  _handleClick = event => {
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({
        x,
        y
      });

      if (info) {
        const {layer} = info;
        if (layer.id.startsWith('cr-matrix-y-axis')) {
          const {object} = info;
          this.props.updateCrMatrixFocus(`(${object.id}, ${0})`);
        } else if (layer.id.startsWith('cr-matrix-x-axis')) {
          const {object} = info;
          this.props.updateCrMatrixFocus(`(${object.id}, ${1})`);
        }
      }
    }
  };

  render() {
    const {
      showWindow,
      windowSize: [width, height]
    } = this.props;
    const {getCursor} = this.state;
    return (
      showWindow && (
        <PopupWindow
          ref={input => (this.container = input)}
          x={600}
          y={50}
          width={width}
          height={height}
          style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
          onResize={(event, {width, height}) => {
            this.props.updateCrMatrixWindowSize([width, height]);
          }}
          onClose={() => this.props.updateShowCrMatrixWindow(false)}
          contentProps={{
            onClick: this._handleClick,
            onMouseMove: this._handleMouseMove
          }}
        >
          <DeckGLContainer
            ref={input => {
              this.deckGLContainer = input;
            }}
            {...this.props}
            width={width}
            height={height - 20}
            getCursor={getCursor}
          />
        </PopupWindow>
      )
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
