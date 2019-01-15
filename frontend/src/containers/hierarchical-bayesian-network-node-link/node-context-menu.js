import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {getTreeLeaves, findCluster} from '../../utils';
import {
  updateShowBayesianNetworkSubNetworkDetailWindow,
  updateSelectedSubBayesianNetworkId,
  requestReplaceSubBayesianModels,
  bundleFetchClusterBayesianModel
} from '../../actions';
import {
  getSelectedModel,
  getRawHierarchicalClusteringTree
} from '../../selectors/data';

const mapDispatchToProps = {
  updateShowBayesianNetworkSubNetworkDetailWindow,
  updateSelectedSubBayesianNetworkId,
  requestReplaceSubBayesianModels,
  bundleFetchClusterBayesianModel
};

const mapStateToProps = state => ({
  selectedModel: getSelectedModel(state),
  hierarchicalClusteringTree: getRawHierarchicalClusteringTree(state)
});

class NodeContextMenu extends PureComponent {
  static defaultProps = {
    x: 0,
    y: 0,
    show: false
  };
  constructor(props) {
    super(props);
    this.state = {
      showDetail: {
        hovered: false
      },
      expandCluster: {
        hovered: false
      }
    };
  }
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
  render() {
    const {x, y, show, data} = this.props;
    return show ? (
      <div
        id="node-context-menu"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          zIndex: 10,
          backgroundColor: 'white',
          border: '1px solid grey'
        }}
      >
        <div
          onMouseOver={event => this.setState({showDetail: {hovered: true}})}
          onMouseOut={event => this.setState({showDetail: {hovered: false}})}
          style={{
            cursor: 'pointer',
            backgroundColor: this.state.showDetail.hovered ? 'grey' : null
          }}
          onClick={event => {
            this.props.updateShowBayesianNetworkSubNetworkDetailWindow(true);
            if (data) {
              this.props.updateSelectedSubBayesianNetworkId(data.id);
            }
          }}
        >
          Show Detail
        </div>
        <div
          onMouseOver={event => this.setState({expandCluster: {hovered: true}})}
          onMouseOut={event => this.setState({expandCluster: {hovered: false}})}
          style={{
            cursor: 'pointer',
            backgroundColor: this.state.expandCluster.hovered ? 'grey' : null
          }}
          onClick={event => {
            if (data) {
              const {hierarchicalClusteringTree: tree} = this.props;
              this._expandCluster(tree, Number(data.id));
            }
          }}
        >
          Expand
        </div>
      </div>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeContextMenu);
