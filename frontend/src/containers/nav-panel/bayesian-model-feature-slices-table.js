import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DataTable from '../../components/data-table';
import {filterObject} from '../../utils';
import {
  getSelectedModel,
  getBayesianModelFeatureSlicesTableData,
  getRawBayesianModelFeatureSliceMap
} from '../../selectors/data';
import {bundleRequestUpdateBayesianModelFeatureSlices} from '../../actions';

const mapDispatchToProps = {
  bundleRequestUpdateBayesianModelFeatureSlices
};

const mapStateToProps = state => ({
  selectedModel: getSelectedModel(state),
  data: getBayesianModelFeatureSlicesTableData(state),
  featureSliceMap: getRawBayesianModelFeatureSliceMap(state)
});

class BayesianModelFeatureSlicesTable extends PureComponent {
  render() {
    const {featureSliceMap, selectedModel} = this.props;
    const {data} = this.props;
    return (
      <DataTable
        disableSelect
        data={data}
        removeData={({key}) => {
          this.props.bundleRequestUpdateBayesianModelFeatureSlices({
            name: selectedModel,
            featureSliceMap: filterObject(featureSliceMap, k => k !== key)
          });
        }}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BayesianModelFeatureSlicesTable);
