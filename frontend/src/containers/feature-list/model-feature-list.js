import React, {PureComponent} from 'react';
import {List, Select} from 'antd';

export default class FeatureList extends PureComponent {
  _renderSelect = values => (
    <Select defaultValue="" size="small" style={{width: 200}}>
      {values.map(value => (
        <Select.Option key={value} value={value}>
          {value}
        </Select.Option>
      ))}
    </Select>
  );
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
        renderItem={({feature, values}) => (
          <List.Item actions={[this._renderSelect(values)]}>
            {feature}
          </List.Item>
        )}
        style={{marginLeft: 5}}
      />
    );
  }
}
