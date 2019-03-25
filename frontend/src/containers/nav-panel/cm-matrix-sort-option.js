import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Radio} from 'antd';
import {getRawCmSortOption} from '../../selectors/data';
import {updateCmSortOption} from '../../actions';

const mapDispatchToProps = {updateCmSortOption};

const mapStateToProps = state => ({
  sortOption: getRawCmSortOption(state)
});

class CmMatrixSortOption extends PureComponent {
  _handleChange = event => this.props.updateCmSortOption(event.target.value);
  render() {
    const {sortOption} = this.props;
    return (
      <div>
        <div>{`CM Element Selection`}</div>
        <Radio.Group onChange={this._handleChange} value={sortOption}>
          <Radio value={0}>Positive</Radio>
          <Radio value={1}>Negative</Radio>
        </Radio.Group>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CmMatrixSortOption);
