import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Select} from 'antd';

import {
  getCurrentDatasetName,
  getDatasetList,
  getHierarchicalClusteringOption
} from '../../selectors/data';

import {
  fetchModelList,
  fetchDistanceMap,
  fetchFeatureSelection,
  fetchHierarchicalClusteringTree,
  requestUpdateCurrentDatasetName,
  updateBayesianNetwork,
  updateSelectedModel
} from '../../actions';

const mapDispatchToProps = {
  fetchModelList,
  fetchDistanceMap,
  fetchFeatureSelection,
  fetchHierarchicalClusteringTree,
  requestUpdateCurrentDatasetName,
  updateBayesianNetwork,
  updateSelectedModel
};

const mapStateToProps = state => ({
  currentDatasetName: getCurrentDatasetName(state),
  datasetList: getDatasetList(state),
  hierarchicalClusteringOption: getHierarchicalClusteringOption(state)
});

class DataSelect extends PureComponent {
  render() {
    const {
      currentDatasetName,
      datasetList,
      hierarchicalClusteringOption
    } = this.props;
    return (
      <div>
        <Input.Group compact>
          <span>Dataset: </span>
          <Select
            value={currentDatasetName}
            onChange={async name => {
              await this.props.requestUpdateCurrentDatasetName(name);
              await this.props.fetchModelList();
              await this.props.fetchFeatureSelection();
              await this.props.fetchDistanceMap(hierarchicalClusteringOption);
              await this.props.fetchHierarchicalClusteringTree(
                hierarchicalClusteringOption
              );
              this.props.updateSelectedModel(null);
              this.props.updateBayesianNetwork([]);
            }}
            style={{width: '50%'}}
          >
            {datasetList.map(name => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Input.Group>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSelect);
