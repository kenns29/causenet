import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Select} from 'antd';

import {
  getCurrentDatasetName,
  getDatasetList,
  getHierarchicalClusteringOption
} from '../../selectors/data';

import {bundleRequestUpdateSelectedDataset} from '../../actions';

const mapDispatchToProps = {
  bundleRequestUpdateSelectedDataset
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
            onChange={name => {
              this.props.bundleRequestUpdateSelectedDataset(
                name,
                hierarchicalClusteringOption
              );
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
