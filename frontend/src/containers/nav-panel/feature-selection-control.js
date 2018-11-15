import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Button} from 'antd';
import {
  getRawFeatureSelection,
  getHierarchicalClusteringCutClustering
} from '../../selectors/data';
import {requestUpdateFeatureSelection} from '../../actions';

const mapDispatchToProps = {
  requestUpdateFeatureSelection
};

const mapStateToProps = state => ({
  featureSelection: getRawFeatureSelection(state),
  hierarchicalClusteringCutClustering: getHierarchicalClusteringCutClustering(
    state
  )
});

class FeatureSelectionControl extends PureComponent {
  render() {
    return (
      <div>
        <Input.Group compact>
          <Button
            type="default"
            size="small"
            onClick={event => this.props.requestUpdateFeatureSelection(null)}
          >
            Clear All Cluster Features
          </Button>
          <Button
            type="default"
            size="small"
            onClick={event => {
              const {
                hierarchicalClusteringCutClustering: hCut,
                featureSelection
              } = this.props;
              const curFeatures = featureSelection || [];
              const cutFeatures =
                hCut.length > 1 ? hCut.map(({rep: {name}}) => name) : [];
              const features = [...new Set([...curFeatures, ...cutFeatures])];
              this.props.requestUpdateFeatureSelection(
                features.length ? features : null
              );
            }}
          >
            Select All Cluster Features
          </Button>
        </Input.Group>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureSelectionControl);
