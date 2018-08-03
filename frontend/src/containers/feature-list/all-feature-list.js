import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {List} from 'antd';
import {getFeatureList} from '../../selectors/data';
const mapDispatchToProps = {};

const mapStateToProps = state => ({
  features: getFeatureList(state)
});

class FeatureList extends PureComponent {
  render() {
    const {features, height} = this.props;
    const dataSource = features || [];
    return (
      <List
        itemLayout="horizontal"
        pagination={{
          size: 'small',
          pageSize: Math.floor(height / 40),
          showSizeChanger: true
        }}
        size="small"
        dataSource={dataSource}
        renderItem={item => <List.Item>{item}</List.Item>}
        style={{marginLeft: 5}}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureList);
