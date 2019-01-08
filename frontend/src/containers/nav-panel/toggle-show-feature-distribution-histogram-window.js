import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getShowFeatureDistributionWindow} from '../../selectors/base';
import {updateShowFeatureDistributionWindow} from '../../actions';

const mapDispatchToProps = {
  updateShowFeatureDistributionWindow
};

const mapStateToProps = state => ({
  showFeatureDistributionWindow: getShowFeatureDistributionWindow(state)
});

class ToggleShowFeatureDistributionWindow extends PureComponent {
  render() {
    const {showFeatureDistributionWindow} = this.props;
    return (
      <div>
        <span>{`Show Feature Distribution`}</span>
        <Switch
          checked={showFeatureDistributionWindow}
          onChange={checked =>
            this.props.updateShowFeatureDistributionWindow(checked)
          }
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleShowFeatureDistributionWindow);
