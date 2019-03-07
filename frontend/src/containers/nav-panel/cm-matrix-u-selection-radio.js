import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Radio} from 'antd';
import {getRawCmUSelection} from '../../selectors/data';
import {bundleFetchUpdateCmUSelection} from '../../actions';

const mapDispatchToProps = {
  bundleFetchUpdateCmUSelection
};

const mapStateToProps = state => ({
  cmUSelection: getRawCmUSelection(state)
});

class CmMatrixUSelectionRadio extends PureComponent {
  _handleChange = event => {
    this.props.bundleFetchUpdateCmUSelection({u: event.target.value});
  };
  render() {
    const {cmUSelection} = this.props;
    return (
      <div>
        <div>{`CM U Selection`}</div>
        <Radio.Group onChange={this._handleChange} value={cmUSelection}>
          <Radio value={0}>Export</Radio>
          <Radio value={1}>Import</Radio>
        </Radio.Group>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CmMatrixUSelectionRadio);
