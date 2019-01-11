import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Spin} from 'antd';
import DeckGLContainer from './deckgl-container';
import PathTooltip from './path-tooltip';
import NodeContextMenu from './node-context-menu';
import {getTreeLeaves, findCluster} from '../../utils';
import {
  getSelectedModel,
  getIsFetchingModifiedBayesianNetwork,
  getClusterBayesianNetworkNodeLinkLayout,
  getShiftedReducedAbstractSubBayesianNetworkNodeLinkLayouts,
  getRawHierarchicalClusteringTree,
  getRawSubBayesianNetworkSliceMap,
  getAbstractSubBayesianNetworkMap,
  getRawDistributionFeaturePairs,
  getRawSelectedNormalizedFeatureDistributionMap
} from '../../selectors/data';
import {
  requestReplaceSubBayesianModels,
  bundleFetchClusterBayesianModel,
  updateSubBayesianNetworkSliceMap,
  bundleFetchAddToPairDistributions
} from '../../actions';

const mapDispatchToProps = {
  requestReplaceSubBayesianModels,
  bundleFetchClusterBayesianModel,
  updateSubBayesianNetworkSliceMap,
  bundleFetchAddToPairDistributions
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
  abstractSubBayesianNetworkMap: getAbstractSubBayesianNetworkMap(state),
  distributionFeaturePairs: getRawDistributionFeaturePairs(state),
  selectedNormalizedFeatureDistributionMap: getRawSelectedNormalizedFeatureDistributionMap(
    state
  )
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
      hoveredNodes: [],
      hoveredPath: null,
      getCursor: () => 'auto',
      nodeContextMenu: {
        x: 0,
        y: 0,
        show: false
      }
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
        y
      });
      if (info) {
        const {id: layerId} = info.layer;
        if (layerId === 'hierarchical-bayesian-network-node-link-nodes-layer') {
          const {object} = info;
          this.setState({
            hoveredNodes: object ? [{...object, mouseX: x, mouseY: y}] : [],
            hoveredPath: null,
            disableZoom:
              info.object &&
              info.object.cluster &&
              info.object.cluster.length > 1,
            getCursor: () => 'auto'
          });
        } else if (
          layerId === 'hierarchical-bayesian-network-node-link-path-layer'
        ) {
          this.setState({
            hoveredNodes: [],
            hoveredPath: null,
            disableZoom: false,
            getCursor: () => 'pointer'
          });
        } else if (
          layerId.includes(
            'hierarchical-bayesian-network-node-link-sub-path-layer-'
          )
        ) {
          const {object} = info;
          const path = [{node: {...object.source}, weight: 0}, ...object.path];
          this.setState({
            hoveredPath: {path, left: x - 10, top: y - 200},
            hoveredNodes: [],
            disableZoom: true,
            getCursor: () => 'auto'
          });
        } else {
          this.setState({
            hoveredNodes: [],
            hoveredPath: null,
            disableZoom: false,
            getCursor: () => 'auto'
          });
        }
      } else {
        this.setState({
          hoveredNodes: [],
          hoveredPath: null,
          disableZoom: false,
          getCursor: () => 'auto'
        });
      }
    }
    event.preventDefault();
    event.stopPropagation();
  };
  _handleClick = event => {
    const {
      selectedNormalizedFeatureDistributionMap,
      distributionFeaturePairs
    } = this.props;
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({
        x,
        y
      });
      if (info) {
        const {id: layerId} = info.layer;
        if (layerId === 'hierarchical-bayesian-network-node-link-nodes-layer') {
          const {object} = info;
          const {hierarchicalClusteringTree: tree} = this.props;
          this._expandCluster(tree, Number(object.label));
        } else if (
          layerId === 'hierarchical-bayesian-network-node-link-path-layer'
        ) {
          const {object} = info;
          const {source, target} = object;
          this.props.bundleFetchAddToPairDistributions({
            pair: {source, target},
            distributionFeaturePairs,
            selectedNormalizedFeatureDistributionMap
          });
        }
      }
      this.setState({
        nodeContextMenu: {
          show: false
        }
      });
    }
  };
  _handleContextMenu = event => {
    if (this._getDeck()) {
      const [x, y] = this._getEventMouse(event);
      const info = this._pickObject({
        x,
        y
      });
      if (info) {
        const {id: layerId} = info.layer;
        if (layerId === 'hierarchical-bayesian-network-node-link-nodes-layer') {
          this.setState({
            nodeContextMenu: {
              x: x + 10,
              y,
              show: true
            }
          });
          event.preventDefault();
        }
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
              {cluster
                .slice(0, 1)
                .map(feature => <div key={feature}>{`${feature}`}</div>)}
            </div>
          );
        })}
      </React.Fragment>
    );
  }
  _renderPathTooltip() {
    const {hoveredPath} = this.state;
    return (
      hoveredPath && (
        <PathTooltip
          path={hoveredPath.path}
          left={hoveredPath.left}
          top={hoveredPath.top}
        />
      )
    );
  }
  _renderNodeContextMenu() {
    const {x, y, show} = this.state.nodeContextMenu;
    return <NodeContextMenu x={x} y={y} show={show} />;
  }
  render() {
    const {width, height, isFetchingModifiedBayesianNetwork} = this.props;
    const {disableZoom, disableMove, getCursor} = this.state;
    return (
      <div
        ref={input => (this.container = input)}
        style={this.containerStyle}
        width={width}
        height={height}
        onMouseMove={this._handleMouseMove}
        onClick={this._handleClick}
        onWheel={this._handleWheel}
        onContextMenu={this._handleContextMenu}
      >
        {isFetchingModifiedBayesianNetwork && (
          <Spin
            tip="loading..."
            size="large"
            style={{position: 'absolute', left: width / 2, top: height / 2}}
          />
        )}
        {this._renderTooltip()}
        {this._renderPathTooltip()}
        {this._renderNodeContextMenu()}
        <DeckGLContainer
          ref={input => (this.deckGLContainer = input)}
          {...this.props}
          disableZoom={disableZoom}
          disableMove={disableMove}
          getCursor={getCursor}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
