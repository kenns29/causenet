import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DataTable from '../../components/data-table';
import {getRawBayesianModelFeatureSliceMap} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  featureSliceMap: getRawBayesianModelFeatureSliceMap(state)
});

class BayesianModelFeatureSlicesTable extends PureComponent {
  render() {
    const {featureSliceMap} = this.props;
    const featureSlices = Object.entries(featureSliceMap).map(
      ([feature, slice]) => ({key: feature, feature, slice})
    );
    return <DataTable data={featureSlices} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BayesianModelFeatureSlicesTable);
