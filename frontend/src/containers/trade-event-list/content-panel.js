import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import {
  getShowTradeEventListWindow,
  getTradeEventListWindowSize,
  getPopupWindowOrder
} from '../../selectors/base';
import {getRawAcledList} from '../../selectors/data';
import {
  updateShowTradeEventListWindw,
  updateTradeEventListWindowSize,
  updatePopupWindowOrder
} from '../../actions';

const mapDispatchToProps = {
  updateShowTradeEventListWindw,
  updateTradeEventListWindowSize,
  updatePopupWindowOrder
};

const mapStateToProps = state => ({
  show: getShowTradeEventListWindow(state),
  windowSize: getTradeEventListWindowSize(state),
  acledList: getRawAcledList(state),
  popupWindowOrder: getPopupWindowOrder(state)
});

const ID = 'trade-event-list';
const NAME = 'TradeEventList';

class TradeEventList extends PureComponent {
  render() {
    const {
      show,
      windowSize: [windowWidth, windowHeight],
      popupWindowOrder
    } = this.props;
    return (
      <PopupWindow
        show={show}
        x={1500}
        y={300}
        width={windowWidth}
        height={windowHeight}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onClose={() => this.props.updateShowCmSelectedBnWindow(false)}
        onClose={() => this.props.updateShowTradeEventListWindw(false)}
        onResize={(event, {width, height}) =>
          this.props.updateTradeEventListWindowSize([width, height])
        }
        onMouseDown={() =>
          popupWindowOrder[popupWindowOrder.length - 1] === NAME ||
          this.props.updatePopupWindowOrder([
            ...popupWindowOrder.filter(d => d !== NAME),
            NAME
          ])
        }
      >
        <div />
      </PopupWindow>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TradeEventList);
