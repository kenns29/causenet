import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {getModelList, getSelectedModel} from '../selectors/data';
import {
  requestDeleteModel,
  updateSelectedModel,
  fetchBayesianNetwork,
  fetchModelList
} from '../actions';
import DataTable from './data-table';

const mapDispatchToProps = {
  requestDeleteModel,
  updateSelectedModel,
  fetchBayesianNetwork,
  fetchModelList
};

const mapStateToProps = state => ({
  modelList: getModelList(state),
  selectedModel: getSelectedModel(state)
});

class ModelList extends PureComponent {
  render() {
    const {modelList, selectedModel} = this.props;
    return (
      <DataTable
        data={modelList.map(d => ({...d, key: d.name}))}
        removeData={async key => {
          await this.props.requestDeleteModel({name: key});
          this.props.fetchModelList();
        }}
        selectData={key => {
          this.props.updateSelectedModel(key);
          this.props.fetchBayesianNetwork({name: key});
        }}
        checked={(text, record) => record.key === selectedModel}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelList);
