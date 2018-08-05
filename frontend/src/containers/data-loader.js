import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree,
  fetchDistanceMap,
  fetchFeatureSelection,
  fetchFeatureValuesMap
} from '../actions';

const mapDispatchToProps = {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree,
  fetchDistanceMap,
  fetchFeatureSelection,
  fetchFeatureValuesMap
};

const mapStateToProps = state => ({});

class DataLoader extends PureComponent {
  async componentDidMount() {
    await Promise.all([
      this.props.fetchDatasetList(),
      this.props.fetchCurrentDatasetName()
    ]);
    this.props.fetchModelList();
    await this.props.fetchDistanceMap();
    this.props.fetchHierarchicalClusteringTree();
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
