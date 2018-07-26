import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree,
  fetchDistanceMap
} from '../actions';

const mapDispatchToProps = {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree,
  fetchDistanceMap
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
  }
  render() {
    return null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataLoader);
