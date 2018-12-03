import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DataTable from '../../components/data-table';
import {getModelList, getSelectedModel} from '../../selectors/data';
import {
  requestDeleteModel,
  updateSelectedModel,
  fetchBayesianNetwork,
  fetchModifiedBayesianNetwork,
  fetchClusterBayesianNetwork,
  fetchClusterBayesianModelFeatures,
  fetchSubBayesianNetworks,
  fetchBayesianModelFeatures,
  fetchModelFeatureValueSelectionMap,
  fetchModelList
} from '../../actions';

const mapDispatchToProps = {
  requestDeleteModel,
  updateSelectedModel,
  fetchBayesianNetwork,
  fetchModifiedBayesianNetwork,
  fetchClusterBayesianNetwork,
  fetchClusterBayesianModelFeatures,
  fetchSubBayesianNetworks,
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
        removeData={async({key: name}) => {
          await this.props.requestDeleteModel({name});
          this.props.fetchModelList();
        }}
        selectData={async({key: name, is_cluster_model: isClusterModel}) => {
          if (isClusterModel === 'true') {
            this.props.updateSelectedModel(name);
            this.props.fetchClusterBayesianNetwork({name});
            this.props.fetchClusterBayesianModelFeatures({name});
            this.props.fetchSubBayesianNetworks({name});
          } else {
            this.props.updateSelectedModel(name);
            this.props.fetchBayesianModelFeatures({name});
            this.props.fetchModelFeatureValueSelectionMap({name});
            await this.props.fetchModifiedBayesianNetwork({name});
            this.props.fetchBayesianNetwork({name});
          }
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
