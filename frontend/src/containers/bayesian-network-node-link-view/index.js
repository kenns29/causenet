import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getNodeLinkViewOptions} from '../../selectors/data';
import BayesianNetworkNodeLink from '../bayesian-network-node-link';
import HierarchicalBayesianNetworkNodeLink from '../hierarchical-bayesian-network-node-link';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  nodeLinkViewOptions: getNodeLinkViewOptions(state)
});

class BayesianNetworkNodeLinkView extends PureComponent {
  render() {
    const {
      width,
      height,
      nodeLinkViewOptions: {useHierarchy}
    } = this.props;
    return (
      <React.Fragment>
        {useHierarchy ? (
          <HierarchicalBayesianNetworkNodeLink width={width} height={height} />
        ) : (
          <BayesianNetworkNodeLink width={width} height={height} />
        )}
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BayesianNetworkNodeLinkView);
