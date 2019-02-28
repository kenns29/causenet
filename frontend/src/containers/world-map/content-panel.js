import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {getShowWorldMapWindow} from '../../selectors/base';
import {updateShowWorldMapWindow} from '../../actions';

const mapDispatchToProps = {updateShowWorldMapWindow};

const mapStateToProps = state => ({
  show: getShowWorldMapWindow(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {show} = this.props;
    return show ? (
      <PopupWindow
        x={300}
        y={200}
        width={600}
        height={600}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onClose={() => this.props.updateShowWorldMapWindow(false)}
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
