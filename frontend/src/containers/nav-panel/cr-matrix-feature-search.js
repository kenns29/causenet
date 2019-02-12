import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {AutoComplete, Tag} from 'antd';
import {array2Object} from '../../utils';
import {
  getRawCrRelationFeatures,
  getRawCrMatrixFocus,
  getCrRelationFeatureIdToNameMap
} from '../../selectors/data';
import {updateCrMatrixFocus} from '../../actions';

const mapDispatchToProps = {updateCrMatrixFocus};

const mapStateToProps = state => ({
  features: getRawCrRelationFeatures(state),
  focus: getRawCrMatrixFocus(state),
  id2Name: getCrRelationFeatureIdToNameMap(state)
});

const parseFocus = focus => {
  if (!focus) {
    return [null, 3];
  }
  const [f, u] = focus.split(',').map(d => d.match(/\w+/)[0]);
  return [f, Number(u)];
};

class CrMatrixFeatureSearch extends PureComponent {
  render() {
    const {features, focus, id2Name} = this.props;
    const dataSource = features
      .map(d => d.name)
      .sort((a, b) => (a <= b ? -1 : 1));
    const name2Id = array2Object(features, d => d.name, d => d.id);
    const [feature, u] = parseFocus(focus);
    return (
      <React.Fragment>
        <div>
          <div>
            <span>Row: </span>
            <AutoComplete
              key="row"
              dataSource={dataSource}
              style={{width: 100}}
              placeholder="row"
              filterOption={(inputValue, option) =>
                option.props.children
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
              onSelect={value =>
                this.props.updateCrMatrixFocus(`(${name2Id[value]}, ${0})`)
              }
            />
          </div>
          {u === 0 ? (
            <div>
              <Tag
                closable
                onClose={() => this.props.updateCrMatrixFocus(null)}
              >
                {id2Name[feature]}
              </Tag>
            </div>
          ) : null}
        </div>
        <div>
          <div>
            <span>Column: </span>
            <AutoComplete
              key="col"
              dataSource={dataSource}
              style={{width: 100}}
              placeholder="column"
              filterOption={(inputValue, option) =>
                option.props.children
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
              onSelect={value =>
                this.props.updateCrMatrixFocus(`(${name2Id[value]}, ${1})`)
              }
            />
          </div>
          {u === 1 ? (
            <div>
              <Tag
                closable
                onClose={() => this.props.updateCrMatrixFocus(null)}
              >
                {id2Name[feature]}
              </Tag>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CrMatrixFeatureSearch);
