import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Layout} from 'antd';
import {window} from 'global';
import DataLoader from './data-loader';
import NavPanel from './nav-panel';
import BayesianNetworkView from './bayesian-network-view';
import {updateScreenSize} from '../actions';
import {LAYOUT} from '../constants';
const mapDispatchToProps = {updateScreenSize};

const mapStateToProps = state => ({});

class AppContainer extends PureComponent {
  get containerStyle() {
    const {CONTAINER_PADDING} = LAYOUT;
    return {
      display: 'inline-flex',
      width: '100vw',
      height: '100vh',
      padding: `${CONTAINER_PADDING}px ${CONTAINER_PADDING}px`
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
  componentDidMount() {
    window.addEventListener('resize', this._handleResize);
    this._handleResize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
  }
  _handleResize = () => {
    this.props.updateScreenSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
  render() {
    const {NAV_PANEL_WIDTH} = LAYOUT;
    return (
      <React.Fragment>
        <DataLoader />
        <Layout>
          <Layout.Content style={this.containerStyle}>
            <Layout.Sider width={NAV_PANEL_WIDTH} style={this.navPanelStyle}>
              <NavPanel />
            </Layout.Sider>
            <Layout.Content style={this.contentPanelStyle}>
              <BayesianNetworkView />
            </Layout.Content>
          </Layout.Content>
        </Layout>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer);
