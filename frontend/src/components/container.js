import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Layout} from 'antd';

const mapDispatchToProps = {};

const mapStateToProps = state => ({});

class AppContainer extends PureComponent {
  render() {
    return <Layout />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer);
