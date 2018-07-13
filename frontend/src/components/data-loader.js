import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {fetchModelList, fetchBayesianNetwork} from '../actions';

const mapDispatchToProps = {fetchModelList, fetchBayesianNetwork};

const mapStateToProps = state => ({});

class DataLoader extends PureComponent {
  async componentDidMount() {
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
