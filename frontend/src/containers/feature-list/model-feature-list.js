import React, {PureComponent} from 'react';
import {List} from 'antd';

export default class FeatureList extends PureComponent {
  render() {
    const {features, height} = this.props;
    const dataSource = features || [];
    return (
      <List
        itemLayout="horizontal"
        pagination={{
          size: 'small',
          pageSize: Math.floor(height / 40)
        }}
        dataSource={dataSource}
        size="small"
        renderItem={({feature}) => <List.Item>{feature}</List.Item>}
        style={{marginLeft: 5}}
      />
    );
  }
}
