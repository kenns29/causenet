import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {getShowWorldMapWindow, getPopupWindowOrder} from '../../selectors/base';
import {updateShowWorldMapWindow, updatePopupWindowOrder} from '../../actions';

const mapDispatchToProps = {updateShowWorldMapWindow, updatePopupWindowOrder};

const mapStateToProps = state => ({
  show: getShowWorldMapWindow(state),
  popupWindowOrder: getPopupWindowOrder(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {show, popupWindowOrder} = this.props;
    return show ? (
      <PopupWindow
        x={300}
        y={200}
        width={600}
        height={600}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onClose={() => this.props.updateShowWorldMapWindow(false)}
        onClick={() =>
          popupWindowOrder[popupWindowOrder.length - 1] === NAME ||
          this.props.updatePopupWindowOrder([
            ...popupWindowOrder.filter(d => d !== NAME),
            NAME
          ])
        }
      >
        <div style={{width: 600, height: 580}}>
          <DeckGLContainer />
        </div>
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
