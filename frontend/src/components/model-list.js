import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {requestDeleteModel} from '../actions';

const mapDispatchToProps = {requestDeleteModel};

const mapStateToProps = state => ({});

class ModelList extends PureComponent {
  render() {
    return null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelList);
