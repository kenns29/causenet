import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Divider} from 'antd';
import {
  getRawCountries,
  getRawItems,
  getModelList,
  getCurrentDatasetName
} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  categories: getRawItems(state),
  features: getRawCountries(state)
});

class ModelTuning extends PureComponent {
  render() {
    const {height} = this.props;
    return (
      <div style={{height, overflow: 'auto'}}>
        <div>
          <span> Model: </span>
        </div>
        <Divider />
        <div>
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelTuning);
