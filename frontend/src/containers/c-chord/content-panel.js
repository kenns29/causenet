import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {getCcLayout} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  layout: getCcLayout(state)
});

class ContentPanel extends PureComponent {
  render() {
    return (
      <PopupWindow
        ref={input => (this.container = input)}
        x={600}
        y={50}
        width={800}
        height={800}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
      >
        <DeckGLContainer
          ref={input => {
            this.deckGLContainer = input;
          }}
          {...this.props}
          width={800}
          height={800 - 20}
        />
      </PopupWindow>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
