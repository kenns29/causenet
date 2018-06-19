import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  getContentPanelWidth,
  getContentPanelHeight
} from '../../selectors/base';
import {getRawData} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  width: getContentPanelWidth(state),
  height: getContentPanelHeight(state),
  data: getRawData(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      border: '1px dashed #DDD',
      borderRadius: 8,
      height: '-webkit-fill-available'
    };
  }

  render() {
    return <div />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
