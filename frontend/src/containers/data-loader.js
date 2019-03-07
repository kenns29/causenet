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
  fetchCrRelations,
  fetchCrRelationFeatures,
  fetchCmCorrelations,
  fetchCountries,
  fetchItems
} from '../actions';

const mapDispatchToProps = {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree,
  fetchDistanceMap,
  fetchFeatureSelection,
  fetchFeatureValuesMap,
  fetchCrRelations,
  fetchCrRelationFeatures,
  fetchCmCorrelations,
  fetchCountries,
  fetchItems
};

const mapStateToProps = state => ({
  hierarchicalClusteringOption: getHierarchicalClusteringOption(state)
});

class DataLoader extends PureComponent {
  async componentDidMount() {
    const {hierarchicalClusteringOption} = this.props;
    this.props.fetchCrRelations();
    this.props.fetchCrRelationFeatures();
    await Promise.all([
      this.props.fetchDatasetList(),
      this.props.fetchCurrentDatasetName()
    ]);
    this.props.fetchModelList();
    // await this.props.fetchDistanceMap(hierarchicalClusteringOption);
    // this.props.fetchHierarchicalClusteringTree(hierarchicalClusteringOption);
    await this.props.fetchFeatureValuesMap();
    this.props.fetchFeatureSelection();
    this.props.fetchCmCorrelations({});
    this.props.fetchCountries();
    this.props.fetchItems();
  }
  render() {
    return null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataLoader);
