import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getShowCrMatrixWindow} from '../../selectors/base';
import {updateShowCrMatrixWindow} from '../../actions';

const mapDispatchToProps = {
  updateShowCrMatrixWindow
};

const mapStateToProps = state => ({
  showCrMatrixWindow: getShowCrMatrixWindow(state)
});

class ToggleShowCrMatrixWindow extends PureComponent {
  render() {
    const {showCrMatrixWindow} = this.props;
    return (
      <div>
        <span>{`Show CR Matrix`}</span>
        <Switch
          checked={showCrMatrixWindow}
          onChange={checked => this.props.updateShowCrMatrixWindow(checked)}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleShowCrMatrixWindow);
