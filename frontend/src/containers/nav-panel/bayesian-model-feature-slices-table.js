import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DataTable from '../../components/data-table';
import {getBayesianModelFeatureSlicesTableData} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  data: getBayesianModelFeatureSlicesTableData(state)
});

class BayesianModelFeatureSlicesTable extends PureComponent {
  render() {
    const {data} = this.props;
    return <DataTable data={data} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BayesianModelFeatureSlicesTable);
