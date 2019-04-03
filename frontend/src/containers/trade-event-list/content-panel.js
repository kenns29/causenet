import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Divider} from 'antd';
import PopupWindow from '../../components/popup-window';
import EventList from './event-list';

import {
  getShowTradeEventListWindow,
  getTradeEventListWindowSize,
  getPopupWindowOrder
} from '../../selectors/base';
import {getTeData} from '../../selectors/data';
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
  popupWindowOrder: getPopupWindowOrder(state),
  data: getTeData(state)
});

const ID = 'trade-event-list';
const NAME = 'TradeEventList';

class TradeEventList extends PureComponent {
  _renderContent(width, height) {
    const {data} = this.props;
    if (!data) {
      return null;
    }
    const {source, target} = data;

    const w = (width - 30 - 20) / 2;

    return (
      <React.Fragment>
        <div
          style={{
            display: 'flex',
            padding: '0px 10px'
          }}
        >
          {[source, target].map((d, i) => (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: w,
                height: 20,
                fontSize: 15,
                fontWeight: 'bold',
                marginLeft: i ? 30 : 0
              }}
            >
              {d.type === 'trade'
                ? `${d.fname}, ${d.cname}, ${d.uname}`
                : `${d.fname}, ${d.cname}`}
            </div>
          ))}
        </div>
        <Divider />
        <div style={{display: 'flex', padding: '0px 10px'}}>
          <div style={{}} />
        </div>
      </React.Fragment>
    );
  }
  render() {
    const {
      show,
      windowSize: [windowWidth, windowHeight],
      popupWindowOrder
    } = this.props;

    const [width, height] = [windowWidth, windowHeight - 20];

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
        {this._renderContent(width, height)}
      </PopupWindow>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TradeEventList);
