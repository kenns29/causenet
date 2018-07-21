import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList
} from '../actions';

const mapDispatchToProps = {
  fetchCurrentDatasetName,
  fetchDatasetList,
  fetchModelList
};

const mapStateToProps = state => ({});

class DataLoader extends PureComponent {
  async componentDidMount() {
    await Promise.all([
      this.props.fetchDatasetList(),
      this.props.fetchCurrentDatasetName()
    ]);
    this.props.fetchModelList();
  }
  render() {
    return null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataLoader);
