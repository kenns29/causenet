import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getShowCmMatrixWindow} from '../../selectors/base';
import {updateShowCmMatrixWindow} from '../../actions';

const mapDispatchToProps = {
  updateShowCmMatrixWindow
};

const mapStateToProps = state => ({
  show: getShowCmMatrixWindow(state)
});

class ToggleShowCmMatrixWindow extends PureComponent {
  render() {
    const {show} = this.props;
    return (
      <div>
        <span>{`Show CM Matrix`}</span>
        <Switch
          checked={show}
          onChange={checked => this.props.updateShowCmMatrixWindow(checked)}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleShowCmMatrixWindow);
