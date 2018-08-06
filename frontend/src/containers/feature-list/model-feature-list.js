import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {List, Select} from 'antd';
import {
  getSelectedModel,
  getBayesianModelFeatures,
  getRawBayesianModelFeatureValueSelectionMap,
  getHighlightedBayesianModelFeature
} from '../../selectors/data';
import {
  updateHighlightedBayesianModelFeature,
  requestUpdateModelFeatureValueSelectionMap,
  fetchModifiedBayesianNetwork
} from '../../actions';
const mapDispatchToProps = {
  updateHighlightedBayesianModelFeature,
  requestUpdateModelFeatureValueSelectionMap,
  fetchModifiedBayesianNetwork
};

const mapStateToProps = state => ({
  selectedModel: getSelectedModel(state),
  features: getBayesianModelFeatures(state),
  highlightedFeature: getHighlightedBayesianModelFeature(state),
  featureValueSelectionMap: getRawBayesianModelFeatureValueSelectionMap(state)
});

const ITEM_HEIGHT = 40;

const str2value = str => {
  switch (str) {
  case 'true':
    return true;
  case 'false':
    return false;
  default:
    return str;
  }
};

const value2str = value => {
  switch (value) {
  case false:
  case true:
    return value.toString();
  default:
    return value;
  }
};

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
  _renderSelect = (feature, values) => {
    const {selectedModel, featureValueSelectionMap} = this.props;
    return (
      <Select
        value={value2str(featureValueSelectionMap[feature])}
        size="small"
        style={{width: 200}}
        onSelect={async value => {
          await this.props.requestUpdateModelFeatureValueSelectionMap({
            name: selectedModel,
            featureValueSelectionMap:
              value === 'NONE'
                ? Object.entries(featureValueSelectionMap)
                  .filter(([key]) => key !== feature)
                  .reduce((m, [key, v]) => Object.assign(m, {[key]: v}), {})
                : {
                  ...featureValueSelectionMap,
                  [feature]: str2value(value)
                }
          });
          await this.props.fetchModifiedBayesianNetwork({name: selectedModel});
        }}
      >
        {['NONE'].concat(values).map(value => {
          const str = value2str(value);
          return (
            <Select.Option key={str} value={str}>
              {str}
            </Select.Option>
          );
        })}
      </Select>
    );
  };
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
            actions={[this._renderSelect(feature, values)]}
            style={{
              backgroundColor: highlightedFeature === feature && 'lightgrey'
            }}
            onClick={() =>
              this.props.updateHighlightedBayesianModelFeature(
                highlightedFeature && highlightedFeature === feature
                  ? null
                  : feature
              )
            }
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
