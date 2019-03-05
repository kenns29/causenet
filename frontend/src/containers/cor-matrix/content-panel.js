import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';

const mapDispatchToProps = {};

const mapStateToProps = state => ({});

class ContentPanel extends PureComponent {
  render() {
    const [width, height] = [800, 800];
    return (
      <PopupWindow
        ref={input => (this.container = input)}
        x={600}
        y={50}
        width={width}
        height={height}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
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
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
