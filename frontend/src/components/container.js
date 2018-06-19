import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Layout} from 'antd';
import NavPanel from './nav-panel';

const mapDispatchToProps = {};

const mapStateToProps = state => ({});

class AppContainer extends PureComponent {
  get containerStyle() {
    return {
      display: 'inline-flex',
      width: '100vw',
      height: '100vh',
      padding: `${20}px ${20}px`
    };
  }
  get navPanelStyle() {
    return {
      backgroundColor: '#F8F8F8',
      zIndex: 2,
      boxShadow: 'inset -2px 0px 4px -2px rgba(0, 0, 0, 0.2)'
    };
  }
  get contentPanelStyle() {
    return {
      backgroundColor: '#FFF',
      boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
      zIndex: 1
    };
  }
  render() {
    return (
      <Layout>
        <Layout.Content style={this.containerStyle}>
          <Layout.Sider width={200} style={this.navPanelStyle}>
            <NavPanel />
          </Layout.Sider>
          <Layout.Content style={this.contentPanelStyle} />
        </Layout.Content>
      </Layout>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer);
