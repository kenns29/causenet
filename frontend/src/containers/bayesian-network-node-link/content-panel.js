import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {getDagLayout, getNodeLinkViewOptions} from '../../selectors/data';
import DeckGLContainer from './deckgl-container';
const mapDispatchToProps = {};

const mapStateToProps = state => ({
  data: getDagLayout(state),
  options: getNodeLinkViewOptions(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }

  render() {
    const {width, height} = this.props;
    return (
      <div style={this.containerStyle} width={width} height={height}>
        <DeckGLContainer {...this.props} />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
