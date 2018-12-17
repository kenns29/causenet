import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DataTable from '../../components/data-table';
import {getModelList, getSelectedModel} from '../../selectors/data';
import {
  requestDeleteModel,
  updateSelectedModel,
  fetchModelList,
  bundleFetchBayesianModel,
  bundleFetchClusterBayesianModel
} from '../../actions';

const mapDispatchToProps = {
  requestDeleteModel,
  updateSelectedModel,
  fetchModelList,
  bundleFetchBayesianModel,
  bundleFetchClusterBayesianModel
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
        selectData={({key: name, is_cluster_model: isClusterModel}) => {
          this.props.updateSelectedModel(name);
          if (isClusterModel === 'true') {
            this.props.bundleFetchClusterBayesianModel(name);
          } else {
            this.props.bundleFetchBayesianModel(name);
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
