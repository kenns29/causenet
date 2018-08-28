import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Slider} from 'antd';
import {getHierarchicalClusteringCutThreshold} from '../../selectors/data';
import {updateHierarchicalClusteringCutThreshold} from '../../actions';

const mapDispatchToProps = {
  updateHierarchicalClusteringCutThreshold
};

const mapStateToProps = state => ({
  hierarchicalClusteringCutThreshold: getHierarchicalClusteringCutThreshold(
    state
  )
});

class ToggleNodeLinkViewLabels extends PureComponent {
  render() {
    const {hierarchicalClusteringCutThreshold} = this.props;
    return (
      <div>
        <span>{`Hierarchical Clustering Cut Threshold `}</span>
        <Slider
          min={0}
          max={2}
          step={0.1}
          defaultValue={hierarchicalClusteringCutThreshold}
          onChange={this.props.updateHierarchicalClusteringCutThreshold}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleNodeLinkViewLabels);
