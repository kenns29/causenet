import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Tabs} from 'antd';
import AllFeatureList from './all-feature-list';
import SelectedFeatureList from './selected-feature-list';
import ModelFeatureList from './model-feature-list';
import {getRawBayesianModelFeatures} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  bayesianModelFeatures: getRawBayesianModelFeatures(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }

  render() {
    const {width, height, bayesianModelFeatures} = this.props;
    return (
      <div style={this.containerStyle} width={width} height={height}>
        <Tabs defaultActiveKey="all">
          <Tabs.TabPane tab="All Features" key="all">
            <AllFeatureList />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Selected Features" key="selected">
            <SelectedFeatureList />
          </Tabs.TabPane>
          {bayesianModelFeatures.length && (
            <Tabs.TabPane tab="Model Features" key="model">
              <ModelFeatureList features={bayesianModelFeatures} />
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
