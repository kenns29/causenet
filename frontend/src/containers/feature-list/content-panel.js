import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Tabs} from 'antd';
import AllFeatureList from './all-feature-list';
import SelectedFeatureList from './selected-feature-list';
import ModelFeatureList from './model-feature-list';
import ModelTuning from './model-tuning';
import {getBayesianModelFeatures} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  bayesianModelFeatures: getBayesianModelFeatures(state)
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
        {height > 100 && (
          <Tabs defaultActiveKey="all">
            <Tabs.TabPane tab="All Features" key="all">
              <AllFeatureList width={width} height={height - 100} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Selected Features" key="selected">
              <SelectedFeatureList width={width} height={height - 100} />
            </Tabs.TabPane>
            {bayesianModelFeatures.length && (
              <Tabs.TabPane tab="Model Features" key="model">
                <ModelFeatureList width={width} height={height - 100} />
              </Tabs.TabPane>
            )}
            <Tabs.TabPane tab="Model Tuning" key="model-tuning">
              <ModelTuning width={width} height={height - 100} />
            </Tabs.TabPane>
          </Tabs>
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
