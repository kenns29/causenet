import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DataTable from '../../components/data-table';
import {getModelList, getSelectedModel} from '../../selectors/data';
import {
  requestDeleteModel,
  updateSelectedModel,
  fetchBayesianNetwork,
  fetchModifiedBayesianNetwork,
  fetchBayesianModelFeatures,
  fetchModelFeatureValueSelectionMap,
  fetchModelList
} from '../../actions';

const mapDispatchToProps = {
  requestDeleteModel,
  updateSelectedModel,
  fetchBayesianNetwork,
  fetchModifiedBayesianNetwork,
  fetchBayesianModelFeatures,
  fetchModelFeatureValueSelectionMap,
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
        selectData={async key => {
          this.props.updateSelectedModel(key);
          this.props.fetchBayesianModelFeatures({name: key});
          this.props.fetchModelFeatureValueSelectionMap({name: key});
          await this.props.fetchModifiedBayesianNetwork({name: key});
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