import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';

const mapDispatchToProps = {};

const mapStateToProps = state => ({});

class ContentPanel extends PureComponent {
  render() {
    return (
      <PopupWindow
        x={300}
        y={200}
        width={600}
        height={600}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
      >
        <div style={{width: 600, height: 580}}>
          <DeckGLContainer />
        </div>
      </PopupWindow>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
