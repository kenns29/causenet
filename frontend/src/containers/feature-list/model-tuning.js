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
  elements: getMtElements(state),
  pfCategories: getMtPreFilteredCategories(state),
  pfFeatures: getMtPreFilteredFeatures(state),
  pfElements: getMtPreFilteredElements(state)
});

class ModelTuning extends PureComponent {
  render() {
    const {
      height,
      modelList,
      model,
      categories,
      features,
      elements,
      pfCategories,
      pfFeatures,
      pfElements
    } = this.props;

    const fsui = [
      {
        key: 'categories',
        name: 'Categories',
        items: categories,
        pfItems: pfCategories
      },
      {
        key: 'features',
        name: 'Features',
        items: features,
        pfItems: pfFeatures
      },
      {
        key: 'elements',
        name: 'Elements',
        items: elements,
        pfItems: pfElements
      }
    ];
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
            {fsui.map(({key, name, items, pfItems}) => (
              <div key={key} style={{marginTop: 10, position: 'relative'}}>
                <div
                  style={{
                    width: 100,
                    float: 'left',
                    marginLeft: 10,
                    position: 'relative'
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    width: 350,
                    height: 300,
                    marginLeft: 10,
                    float: 'left',
                    position: 'relative',
                    overflow: 'auto'
                  }}
                >
                  {items.map(d => <Tag key={d.id}>{d.name.slice(0, 6)}</Tag>)}
                </div>
                <div
                  style={{
                    width: 80,
                    height: 300,
                    marginLeft: 10,
                    position: 'relative',
                    overflow: 'auto'
                  }}
                >
                  {pfItems.map(d => <Tag key={d.id}>{d.name.slice(0, 6)}</Tag>)}
                </div>
              </div>
            ))}
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
