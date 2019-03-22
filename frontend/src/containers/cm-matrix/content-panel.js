import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {
  getShowCmMatrixWindow,
  getCmMatrixWindowSize,
  getPopupWindowOrder
} from '../../selectors/base';
import {
  getCmMatrixLayout,
  getCmMatrixCellSize,
  getRawCmUSelection
} from '../../selectors/data';
import {
  updateShowCmMatrixWindow,
  updateCmMatrixWindowSize,
  updateShowCmSelectedBnWindow,
  updateCmSelectedBnFocusLink,
  updatePopupWindowOrder
} from '../../actions';

const mapDispatchToProps = {
  updateShowCmMatrixWindow,
  updateCmMatrixWindowSize,
  updateShowCmSelectedBnWindow,
  updateCmSelectedBnFocusLink,
  updatePopupWindowOrder
};

const mapStateToProps = state => ({
  showWindow: getShowCmMatrixWindow(state),
  windowSize: getCmMatrixWindowSize(state),
  matrix: getCmMatrixLayout(state),
  cellSize: getCmMatrixCellSize(state),
  popupWindowOrder: getPopupWindowOrder(state),
  u: getRawCmUSelection(state)
});

const NAME = 'CmMatrix';

const tooltipStyle = {
  position: 'absolute',
  padding: '4px',
  background: 'rgba(180, 180, 180, 0.8)',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9,
  pointerEvents: 'none'
};

class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: null
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
      const info = this._pickObject({x, y});
    }
  };

  _handleClick = event => {
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({x, y});
      if (info) {
        const {layer} = info;
        if (
          layer.id === 'cm-matrix-cause-cells' ||
          layer.id === 'cm-matrix-non-cells' ||
          layer.id === 'cm-matrix-spurious-cells'
        ) {
          const {
            data: {direction, isSpurious},
            row_id: f,
            col_id: c
          } = info.object;
          const {u} = this.props;
          if (isSpurious || direction === 1) {
            this.props.updateCmSelectedBnFocusLink({
              source: `(${f}, ${c}, ${u})`,
              target: `(${f}, ${-1}, 0)`,
              direction,
              isSpurious
            });
          } else if (direction === -1) {
            this.props.updateCmSelectedBnFocusLink({
              source: `(${f}, ${-1}, 0)`,
              target: `(${f}, ${c}, ${u})`,
              direction,
              isSpurious
            });
          }
          this.props.updateShowCmSelectedBnWindow(true);
        }
      }
    }
  };

  _renderTooltip() {
    const {tooltip} = this.state;
    if (tooltip) {
      const {content, x, y} = tooltip;
      return (
        <div style={{...tooltipStyle, left: x + 10, top: y - 20}}>
          {content}
        </div>
      );
    }
    return null;
  }

  render() {
    const {
      showWindow,
      windowSize: [width, height],
      popupWindowOrder
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
        contentProps={{
          onClick: this._handleClick
        }}
        onClick={() =>
          popupWindowOrder[popupWindowOrder.length - 1] === NAME ||
          this.props.updatePopupWindowOrder([
            ...popupWindowOrder.filter(d => d !== NAME),
            NAME
          ])
        }
      >
        <DeckGLContainer
          ref={input => {
            this.deckGLContainer = input;
          }}
          {...this.props}
          width={width}
          height={height - 20}
        />
        {this._renderTooltip()}
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
