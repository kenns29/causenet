import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import {fetchData} from '../actions';

const mapDispatchToProps = {fetchData};

const mapStateToProps = state => ({});

class NavPanel extends PureComponent {
  render() {
    return (
      <div>
        <Button
          type="primary"
          size="small"
          onClick={event => this.props.fetchData()}
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
