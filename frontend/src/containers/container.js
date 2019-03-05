import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Layout} from 'antd';
import {window} from 'global';
import {ProgressBar} from 'react-fetch-progressbar';
import DataLoader from './data-loader';
import NavPanel from './nav-panel';
import HierarchicalMatrix from './hierarchical-matrix';
import BayesianNetworkMatrix from './bayesian-network-matrix';
import BayesianNetworkNodeLink from './bayesian-network-node-link';
import BayesianNetworkNodeLinkView from './bayesian-network-node-link-view';
import BayesianNetworkDistribution from './bayesian-network-distribution';
import BayesianNetworkSubNetworkDetail from './bayesian-network-sub-network-detail';
import FeatureDistribution from './feature-distribution';
import CrMatrix from './cr-matrix';
import CChord from './c-chord';
import CmMatrix from './cm-matrix';
import FeatureList from './feature-list';
import WorldMap from './world-map';
import ContentPanelCenter from './content-panel-center';
import {updateScreenSize} from '../actions';
import {LAYOUT} from '../constants';
import {
  getNavPanelWidth,
  getTopLeftSubPanelSize,
  getTopRightSubPanelSize,
  getBottomLeftSubPanelSize,
  getBottomRightSubPanelSize
} from '../selectors/base';

const mapDispatchToProps = {updateScreenSize};

const mapStateToProps = state => ({
  navPanelWidth: getNavPanelWidth(state),
  topLeftSubPanelSize: getTopLeftSubPanelSize(state),
  topRightSubPanelSize: getTopRightSubPanelSize(state),
  bottomLeftSubPanelSize: getBottomLeftSubPanelSize(state),
  bottomRightSubPanelSize: getBottomRightSubPanelSize(state)
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
  get topLeftSubPanelStyle() {
    const {
      topLeftSubPanelSize: [width, height]
    } = this.props;
    return {
      position: 'relative',
      float: 'left',
      border: '1px solid lightgrey',
      width,
      height
    };
  }
  get topRightSubPanelStyle() {
    const {
      topRightSubPanelSize: [width, height]
    } = this.props;
    return {
      position: 'relative',
      float: 'left',
      border: '1px solid lightgrey',
      width,
      height
    };
  }
  get bottomLeftSubPanelStyle() {
    const {
      bottomLeftSubPanelSize: [width, height]
    } = this.props;
    return {
      position: 'relative',
      float: 'left',
      border: '1px solid lightgrey',
      width,
      height
    };
  }
  get bottomRightSubPanelStyle() {
    const {
      bottomRightSubPanelSize: [width, height]
    } = this.props;
    return {
      position: 'relative',
      float: 'left',
      border: '1px solid lightgrey',
      width,
      height
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
    const {navPanelWidth} = this.props;
    return (
      <React.Fragment>
        <ProgressBar />
        <DataLoader />
        <Layout>
          <Layout.Content style={this.containerStyle}>
            <Layout.Sider width={navPanelWidth} style={this.navPanelStyle}>
              <NavPanel />
            </Layout.Sider>
            <Layout.Content style={this.contentPanelStyle}>
              <Layout.Content style={this.topLeftSubPanelStyle}>
                <HierarchicalMatrix
                  width={this.props.topLeftSubPanelSize[0]}
                  height={this.props.topLeftSubPanelSize[1]}
                />
              </Layout.Content>
              <Layout.Content style={this.topRightSubPanelStyle}>
                <FeatureList
                  width={this.props.topRightSubPanelSize[0]}
                  height={this.props.topRightSubPanelSize[1]}
                />
              </Layout.Content>
              <Layout.Content style={this.bottomLeftSubPanelStyle}>
                {
                  //   <BayesianNetworkMatrix
                  //   width={this.props.bottomLeftSubPanelSize[0]}
                  //   height={this.props.bottomLeftSubPanelSize[1]}
                  // />
                }
              </Layout.Content>
              <Layout.Content style={this.bottomRightSubPanelStyle}>
                {
                  //   <BayesianNetworkNodeLinkView
                  //   width={this.props.bottomRightSubPanelSize[0]}
                  //   height={this.props.bottomRightSubPanelSize[1]}
                  // />
                }
              </Layout.Content>
              <ContentPanelCenter />
            </Layout.Content>
          </Layout.Content>
          <BayesianNetworkDistribution />
          <FeatureDistribution />
          <BayesianNetworkSubNetworkDetail />
          <CrMatrix />
          <CChord />
          <CmMatrix />
          <WorldMap />
        </Layout>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer);
