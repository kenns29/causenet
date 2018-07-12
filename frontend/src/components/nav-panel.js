import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import {fetchBayesianNetwork} from '../actions';

const mapDispatchToProps = {fetchBayesianNetwork};

const mapStateToProps = state => ({});

class NavPanel extends PureComponent {
  render() {
    return (
      <div>
        <Button
          type="primary"
          size="small"
          onClick={event => this.props.fetchBayesianNetwork({})}
        >
          Load Data
        </Button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavPanel);
