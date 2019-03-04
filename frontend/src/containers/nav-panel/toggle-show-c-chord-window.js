import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getShowCChordWindow} from '../../selectors/base';
import {updateShowCChordWindow} from '../../actions';

const mapDispatchToProps = {
  updateShowCChordWindow
};

const mapStateToProps = state => ({
  showCChordWindow: getShowCChordWindow(state)
});

class ToggleShowCChordWindow extends PureComponent {
  render() {
    const {showCChordWindow} = this.props;
    return (
      <div>
        <span>{`Show C Chord`}</span>
        <Switch
          checked={showCChordWindow}
          onChange={checked => this.props.updateShowCChordWindow(checked)}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleShowCChordWindow);
