import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Spin} from 'antd';
import {getIsFetchingModifiedBayesianNetwork} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  isFetchingModifiedBayesianNetwork: getIsFetchingModifiedBayesianNetwork(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }

  render() {
    const {width, height, isFetchingModifiedBayesianNetwork} = this.props;
    return (
      <div style={this.containerStyle} width={width} height={height}>
        {isFetchingModifiedBayesianNetwork && (
          <Spin
            tip="loading..."
            size="large"
            style={{position: 'absolute', left: width / 2, top: height / 2}}
          />
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
