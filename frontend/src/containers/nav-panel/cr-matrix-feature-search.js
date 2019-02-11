import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {AutoComplete} from 'antd';
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
