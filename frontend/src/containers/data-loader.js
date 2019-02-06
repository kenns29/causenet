import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {getHierarchicalClusteringOption} from '../selectors/data';
import {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree,
  fetchDistanceMap,
  fetchFeatureSelection,
  fetchFeatureValuesMap,
  fetchCrRelations
} from '../actions';

const mapDispatchToProps = {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree,
  fetchDistanceMap,
  fetchFeatureSelection,
  fetchFeatureValuesMap,
  fetchCrRelations
};

const mapStateToProps = state => ({
  hierarchicalClusteringOption: getHierarchicalClusteringOption(state)
});

class DataLoader extends PureComponent {
  async componentDidMount() {
    const {hierarchicalClusteringOption} = this.props;
    this.props.fetchCrRelations();
    await Promise.all([
      this.props.fetchDatasetList(),
      this.props.fetchCurrentDatasetName()
    ]);
    this.props.fetchModelList();
    await this.props.fetchDistanceMap(hierarchicalClusteringOption);
    this.props.fetchHierarchicalClusteringTree(hierarchicalClusteringOption);
    await this.props.fetchFeatureValuesMap();
    this.props.fetchFeatureSelection();
  }
  render() {
    return null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataLoader);
