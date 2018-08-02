import React, {PureComponent} from 'react';
import {List} from 'antd';

export default class FeatureList extends PureComponent {
  render() {
    const {features} = this.props;
    const dataSource = features || [];
    return (
      <List
        itemLayout="horizontal"
        pagination={{
          size: 'small',
          pageSize: 10
        }}
        dataSource={dataSource}
        size="small"
        renderItem={item => <List.Item>{item}</List.Item>}
        style={{marginLeft: 5}}
      />
    );
  }
}
