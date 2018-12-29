import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import {getShowBayesianNetworkDistributionWindow} from '../../selectors/data';
import {updateShowBayesianNetworkDistributionWindow} from '../../actions';

const mapDispatchToProps = {updateShowBayesianNetworkDistributionWindow};

const mapStateToProps = state => ({
  showBayesianNetworkDistributionWindow: getShowBayesianNetworkDistributionWindow(
    state
  )
});

class ContentPanel extends PureComponent {
  render() {
    const {showBayesianNetworkDistributionWindow} = this.props;
    return (
      showBayesianNetworkDistributionWindow && (
        <PopupWindow
          style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
          onClose={() =>
            this.props.updateShowBayesianNetworkDistributionWindow(false)
          }
        >
          <div>Hello</div>
        </PopupWindow>
      )
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
