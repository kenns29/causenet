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

const ITEM_HEIGHT = 40;

class FeatureList extends PureComponent {
  static getDerivedStateFromProps(props, state) {
    const {features, height, highlightedFeature} = props;
    const {current, prevHighlightedFeature} = state;
    const pageSize = Math.floor(height / ITEM_HEIGHT);
    if (!highlightedFeature || highlightedFeature === prevHighlightedFeature) {
      return {current, pageSize, prevHighlightedFeature: highlightedFeature};
    }
    const dataSource = features || [];
    const highlightedFeatureIndex = dataSource.findIndex(
      ({feature}) => feature === highlightedFeature
    );
    return {
      current:
        highlightedFeatureIndex < 0
          ? 1
          : Math.floor(highlightedFeatureIndex / pageSize) + 1,
      pageSize,
      prevHighlightedFeature: highlightedFeature
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
      pageSize: 1,
      prevHighlightedFeature: null
    };
  }
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
    const {features, highlightedFeature} = this.props;
    const {pageSize} = this.state;
    const dataSource = features || [];
    return (
      <List
        itemLayout="horizontal"
        pagination={{
          size: 'small',
          pageSize,
          current: this.state.current,
          onChange: (current, size) => {
            this.setState({current});
          }
        }}
        dataSource={dataSource}
        size="small"
        renderItem={({feature, values}) => (
          <List.Item
            actions={[this._renderSelect(values)]}
            style={{
              backgroundColor: highlightedFeature === feature && 'lightgrey'
            }}
          >
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
