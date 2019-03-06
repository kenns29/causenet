import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import PopupWindow from '../../components/popup-window';
import {
  getShowCmSelectedBnWindow,
  getCmSelectedBnWindowSize
} from '../../selectors/base';
import {
  updateShowCmSelectedBnWindow,
  updateCmSelectedBnWindowSize
} from '../../actions';

const mapDispatchToProps = {
  updateShowCmSelectedBnWindow,
  updateCmSelectedBnWindowSize
};

const mapStateToProps = state => ({
  show: getShowCmSelectedBnWindow(state),
  windowSize: getCmSelectedBnWindowSize(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {
      show,
      windowSize: [windowWidth, windowHeight]
    } = this.props;
    const [width, height] = [windowWidth, windowHeight - 20];
    return show ? (
      <PopupWindow
        ref={input => (this.container = input)}
        x={1500}
        y={50}
        width={windowWidth}
        height={windowHeight}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onClose={() => this.props.updateShowCmSelectedBnWindow(false)}
        onResize={(event, {width, height}) =>
          this.props.updateCmSelectedBnWindowSize([width, height])
        }
      >
        <UncontrolledReactSVGPanZoom width={width} height={height}>
          <svg width={width} height={height} />
        </UncontrolledReactSVGPanZoom>
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
