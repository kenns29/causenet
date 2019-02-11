import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {AutoComplete} from 'antd';
import {array2Object} from '../../utils';
import {getRawCrRelationFeatures} from '../../selectors/data';
import {updateCrMatrixFocus} from '../../actions';

const mapDispatchToProps = {updateCrMatrixFocus};

const mapStateToProps = state => ({features: getRawCrRelationFeatures(state)});

class CrMatrixFeatureSearch extends PureComponent {
  render() {
    const {features} = this.props;
    const dataSource = features
      .map(d => d.name)
      .sort((a, b) => (a <= b ? -1 : 1));
    const name2Id = array2Object(features, d => d.name, d => d.id);
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CrMatrixFeatureSearch);
