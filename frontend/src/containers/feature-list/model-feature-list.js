import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {List, Select} from 'antd';
import {
  getBayesianModelFeatures,
  getHighlightedBayesianModelFeature
} from '../../selectors/data';
const mapDispatchToProps = {};

const mapStateToProps = state => ({
  features: getBayesianModelFeatures(state),
  highlightedFeature: getHighlightedBayesianModelFeature(state)
});

class FeatureList extends PureComponent {
  _renderSelect = values => (
    <Select defaultValue="" size="small" style={{width: 200}}>
      {values.map(value => {
        const v = typeof value === 'boolean' ? value.toString() : value;
        return (
          <Select.Option key={v} value={v}>
            {v}
          </Select.Option>
        );
      })}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureList);
