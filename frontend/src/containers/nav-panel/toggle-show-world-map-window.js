import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getShowWorldMapWindow} from '../../selectors/base';
import {updateShowWorldMapWindow} from '../../actions';

const mapDispatchToProps = {
  updateShowWorldMapWindow
};

const mapStateToProps = state => ({
  showWorldMapWindow: getShowWorldMapWindow(state)
});

class ToggleShowWorldMapWindow extends PureComponent {
  render() {
    const {showWorldMapWindow} = this.props;
    return (
      <div>
        <span>{`Show World Map Window`}</span>
        <Switch
          checked={showWorldMapWindow}
          onChange={checked => this.props.updateShowWorldMapWindow(checked)}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleShowWorldMapWindow);
