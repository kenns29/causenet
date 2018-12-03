import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Spin} from 'antd';
import DeckGLContainer from './deckgl-container';
import {
  getIsFetchingModifiedBayesianNetwork,
  getClusterBayesianNetworkNodeLinkLayout
} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  isFetchingModifiedBayesianNetwork: getIsFetchingModifiedBayesianNetwork(
    state
  ),
  clusterNodeLink: getClusterBayesianNetworkNodeLinkLayout(state)
});

const tooltipStyle = {
  position: 'absolute',
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9,
  pointerEvents: 'none'
};

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      hoveredNodes: []
    };
  }
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };
  _handleMouseMove = event => {
    if (
      this.deckGLContainer &&
      this.deckGLContainer.container &&
      this.deckGLContainer.container.deck
    ) {
      const {deck} = this.deckGLContainer.container.deck;
      const [left, top] = this._getEventMouse(event);
      const info = deck.pickObject({
        x: left,
        y: top,
        layerIds: ['hierarchical-bayesian-network-node-link-nodes-layer']
      });
      this.setState({
        hoveredNodes:
          info && info.object
            ? [{...info.object, mouseX: left, mouseY: top}]
            : []
      });
    }
    event.preventDefault();
    event.stopPropagation();
  };
  _renderTooltip() {
    const {hoveredNodes} = this.state;
    return (
      <React.Fragment>
        {hoveredNodes.map(({label, mouseX, mouseY, cluster}) => {
          return (
            <div
              key={label}
              style={{...tooltipStyle, left: mouseX + 10, top: mouseY - 20}}
            >
              {cluster.map(feature => <div key={feature}>{`${feature}`}</div>)}
            </div>
          );
        })}
      </React.Fragment>
    );
  }
  render() {
    const {width, height, isFetchingModifiedBayesianNetwork} = this.props;
    return (
      <div
        ref={input => (this.container = input)}
        style={this.containerStyle}
        width={width}
        height={height}
        onMouseMove={this._handleMouseMove}
      >
        {isFetchingModifiedBayesianNetwork && (
          <Spin
            tip="loading..."
            size="large"
            style={{position: 'absolute', left: width / 2, top: height / 2}}
          />
        )}
        {this._renderTooltip()}
        <DeckGLContainer
          ref={input => (this.deckGLContainer = input)}
          {...this.props}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
