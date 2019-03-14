import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Select, Tag, Divider} from 'antd';
import {
  getModelList,
  getRawMtSelectedModel,
  getMtFeatures,
  getMtCategories,
  getMtElements,
  getMtPreFilteredElements,
  getMtPreFilteredFeatures,
  getMtPreFilteredCategories
} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  modelList: getModelList(state),
  model: getRawMtSelectedModel(state),
  categories: getMtCategories(state),
  features: getMtFeatures(state),
  elements: getMtElements(state)
});

class ModelTuning extends PureComponent {
  render() {
    const {
      height,
      modelList,
      model,
      categories,
      features,
      elements
    } = this.props;

    return (
      <React.Fragment>
        <div style={{height: 20, position: 'relative'}}>
          <span> Model: </span>
          <Select style={{width: 150}}>
            {modelList.map(d => (
              <Select.Option key={d.name} value={d.name}>
                {d.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Divider />
        <div
          style={{height: height - 30, overflow: 'auto', position: 'relative'}}
        >
          <div>
            <div style={{marginTop: 10, position: 'relative'}}>
              <div
                style={{
                  width: 100,
                  float: 'left',
                  marginLeft: 10,
                  position: 'relative'
                }}
              >
                Categories
              </div>
              <div
                style={{
                  width: 350,
                  height: 300,
                  float: 'left',
                  position: 'relative',
                  overflow: 'auto'
                }}
              >
                {categories.map(d => (
                  <Tag key={d.item_code}>{d.item.slice(0, 6)}</Tag>
                ))}
              </div>
            </div>
            <div style={{marginTop: 10}}>
              <div />
            </div>
            <div style={{marginTop: 10}}>
              <div />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelTuning);
