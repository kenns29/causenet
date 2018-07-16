import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Layout} from 'antd';
import {window} from 'global';
import {ProgressBar} from 'react-fetch-progressbar';
import DataLoader from './data-loader';
import NavPanel from './nav-panel';
import BayesianNetworkMatrix from './bayesian-network-matrix';
import BayesianNetworkNodeLink from './bayesian-network-node-link';
import {updateScreenSize} from '../actions';
import {LAYOUT} from '../constants';
import {getLeftSubPanelWidth, getRightSubPanelWidth} from '../selectors/base';

const mapDispatchToProps = {updateScreenSize};

const mapStateToProps = state => ({
  leftSubPanelWidth: getLeftSubPanelWidth(state),
  rightSubPanelWidth: getRightSubPanelWidth(state)
});

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
      position: 'relative',
      backgroundColor: '#FFF',
      boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
      zIndex: 1
    };
  }
  get leftSubPanelStyle() {
    const {leftSubPanelWidth: width} = this.props;
    return {
      position: 'relative',
      border: '1px solid black',
      width
    };
  }
  get rightSubPanelStyle() {
    const {rightSubPanelWidth: width} = this.props;
    return {
      position: 'relative',
      border: '1px solid black',
      width,
      float: 'right'
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
        <ProgressBar />
        <DataLoader />
        <Layout>
          <Layout.Content style={this.containerStyle}>
            <Layout.Sider width={NAV_PANEL_WIDTH} style={this.navPanelStyle}>
              <NavPanel />
            </Layout.Sider>
            <Layout.Content style={this.contentPanelStyle}>
              <Layout.Content style={this.leftSubPanelStyle}>
                <BayesianNetworkMatrix />
              </Layout.Content>
              <Layout.Content style={this.rightSubPanelStyle}>
                <BayesianNetworkNodeLink />
              </Layout.Content>
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
