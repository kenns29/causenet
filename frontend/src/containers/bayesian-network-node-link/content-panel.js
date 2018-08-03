import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  getDagLayout,
  getNodeLinkViewOptions,
  getHighlightedBayesianNetworkEdge
} from '../../selectors/data';
import DeckGLContainer from './deckgl-container';
import {updateHighlightedBayesianNetworkEdge} from '../../actions';

const mapDispatchToProps = {updateHighlightedBayesianNetworkEdge};

const mapStateToProps = state => ({
  data: getDagLayout(state),
  options: getNodeLinkViewOptions(state),
  highlightedEdge: getHighlightedBayesianNetworkEdge(state)
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
