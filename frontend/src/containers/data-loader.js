import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree
} from '../actions';

const mapDispatchToProps = {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList,
  fetchHierarchicalClusteringTree
};

const mapStateToProps = state => ({});

class DataLoader extends PureComponent {
  async componentDidMount() {
    await Promise.all([
      this.props.fetchDatasetList(),
      this.props.fetchCurrentDatasetName()
    ]);
    this.props.fetchModelList();
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
