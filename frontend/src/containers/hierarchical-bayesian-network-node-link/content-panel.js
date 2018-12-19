import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Spin} from 'antd';
import DeckGLContainer from './deckgl-container';
import {getTreeLeaves, findCluster} from '../../utils';
import {
  getSelectedModel,
  getIsFetchingModifiedBayesianNetwork,
  getClusterBayesianNetworkNodeLinkLayout,
  getShiftedReducedAbstractSubBayesianNetworkNodeLinkLayouts,
  getRawHierarchicalClusteringTree,
  getRawSubBayesianNetworkSliceMap,
  getAbstractSubBayesianNetworkMap
} from '../../selectors/data';
import {
  requestReplaceSubBayesianModels,
  bundleFetchClusterBayesianModel,
  updateSubBayesianNetworkSliceMap
} from '../../actions';

const mapDispatchToProps = {
  requestReplaceSubBayesianModels,
  bundleFetchClusterBayesianModel,
  updateSubBayesianNetworkSliceMap
};

const mapStateToProps = state => ({
  selectedModel: getSelectedModel(state),
  isFetchingModifiedBayesianNetwork: getIsFetchingModifiedBayesianNetwork(
    state
  ),
  clusterNodeLink: getClusterBayesianNetworkNodeLinkLayout(state),
  subNodeLinks: getShiftedReducedAbstractSubBayesianNetworkNodeLinkLayouts(
    state
  ),
  hierarchicalClusteringTree: getRawHierarchicalClusteringTree(state),
  subBayesianNetworkSliceMap: getRawSubBayesianNetworkSliceMap(state),
  abstractSubBayesianNetworkMap: getAbstractSubBayesianNetworkMap(state)
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
      disableZoom: false,
      disableMove: false,
      hoveredNodes: []
    };
  }
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };
  _getDeck = () =>
    this.deckGLContainer &&
    this.deckGLContainer.container &&
    this.deckGLContainer.container.deck &&
    this.deckGLContainer.container.deck.deck;
  _pickObject = param => {
    const deck = this._getDeck();
    return deck && deck.pickObject(param);
  };
  _handleWheel = event => {
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({
        x,
        y,
        layerIds: ['hierarchical-bayesian-network-node-link-nodes-layer']
      });
      if (
        info &&
        info.object &&
        info.object.cluster &&
        info.object.cluster.length > 1
      ) {
        const {id} = info.object;
        const {
          subBayesianNetworkSliceMap,
          abstractSubBayesianNetworkMap
        } = this.props;
        let [s, t] = subBayesianNetworkSliceMap.hasOwnProperty(id)
          ? subBayesianNetworkSliceMap[id]
          : [0, 10];
        const sliceUpperBound = abstractSubBayesianNetworkMap[id].length;
        if (event.deltaY < 0) {
          if (s > 0) {
            [s, t] = [s - 1, t - 1];
          }
          this.props.updateSubBayesianNetworkSliceMap({
            ...subBayesianNetworkSliceMap,
            [id]: [s, t]
          });
        } else if (t < sliceUpperBound) {
          [s, t] = [s + 1, t + 1];
          this.props.updateSubBayesianNetworkSliceMap({
            ...subBayesianNetworkSliceMap,
            [id]: [s, t]
          });
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  };
  _handleMouseMove = event => {
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({
        x,
        y,
        layerIds: ['hierarchical-bayesian-network-node-link-nodes-layer']
      });
      this.setState({
        hoveredNodes:
          info && info.object ? [{...info.object, mouseX: x, mouseY: y}] : [],
        disableZoom: Boolean(
          info &&
            info.object &&
            info.object.cluster &&
            info.object.cluster.length > 1
        )
      });
    }
    event.preventDefault();
    event.stopPropagation();
  };
  _handleClick = event => {
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({
        x,
        y,
        layerIds: ['hierarchical-bayesian-network-node-link-nodes-layer']
      });
      if (info && info.object) {
        const {hierarchicalClusteringTree: tree} = this.props;
        this._expandCluster(tree, Number(info.object.label));
      }
    }
  };
  _expandCluster = async(tree, id) => {
    const {selectedModel} = this.props;
    const cluster = findCluster(tree, id);
    if (cluster) {
      const targets = [cluster.id];
      const replacements = cluster.children.map(child => ({
        id: child.id,
        features: getTreeLeaves(child).map(d => d.name)
      }));
      await this.props.requestReplaceSubBayesianModels({
        name: selectedModel,
        targets,
        replacements
      });
      this.props.bundleFetchClusterBayesianModel(selectedModel);
    }
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
    const {disableZoom, disableMove} = this.state;
    return (
      <div
        ref={input => (this.container = input)}
        style={this.containerStyle}
        width={width}
        height={height}
        onMouseMove={this._handleMouseMove}
        onClick={this._handleClick}
        onWheel={this._handleWheel}
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
          disableZoom={disableZoom}
          disableMove={disableMove}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
