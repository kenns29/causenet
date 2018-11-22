import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getNodeLinkViewOptions} from '../../selectors/data';
import {updateNodeLinkViewOptions} from '../../actions';

const mapDispatchToProps = {updateNodeLinkViewOptions};

const mapStateToProps = state => ({
  nodeLinkViewOptions: getNodeLinkViewOptions(state)
});

class ToggleHierarchicalBayesianNetwork extends PureComponent {
  render() {
    const {
      nodeLinkViewOptions: {useHierarchy}
    } = this.props;
    return (
      <div>
        <span>{`Show Hierarchical Bayesian Network `}</span>
        <Switch
          checked={useHierarchy}
          onChange={checked =>
            this.props.updateNodeLinkViewOptions({useHierarchy: checked})
          }
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleHierarchicalBayesianNetwork);
