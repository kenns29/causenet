import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {getClusteringMatrixOrder} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  matrixOrder: getClusteringMatrixOrder(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }

  render() {
    const {width, height} = this.props;
    return <div style={this.containerStyle} width={width} height={height} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
