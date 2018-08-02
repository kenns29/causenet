import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Tabs} from 'antd';
import AllFeatureList from './all-feature-list';
import SelectedFeatureList from './selected-feature-list';
const mapDispatchToProps = {};

const mapStateToProps = state => ({});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }

  render() {
    const {width, height} = this.props;
    return (
      <div style={this.containerStyle} width={width} height={height}>
        <Tabs defaultActiveKey="all">
          <Tabs.TabPane tab="All Features" key="all">
            <AllFeatureList />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Selected Features" key="selected">
            <SelectedFeatureList />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
