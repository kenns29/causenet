import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getShowBayesianNetworkDistributionWindow} from '../../selectors/base';
import {updateShowBayesianNetworkDistributionWindow} from '../../actions';

const mapDispatchToProps = {
  updateShowBayesianNetworkDistributionWindow
};

const mapStateToProps = state => ({
  showBayesianNetworkDistributionWindow: getShowBayesianNetworkDistributionWindow(
    state
  )
});

class ToggleShowBayesianNetworkDistributionWindow extends PureComponent {
  render() {
    const {showBayesianNetworkDistributionWindow} = this.props;
    return (
      <div>
        <span>{`Show Distribution`}</span>
        <Switch
          checked={showBayesianNetworkDistributionWindow}
          onChange={checked =>
            this.props.updateShowBayesianNetworkDistributionWindow(checked)
          }
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleShowBayesianNetworkDistributionWindow);
