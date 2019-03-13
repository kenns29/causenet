import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import ZoomableSVG from '../../components/zoomable-svg';
import {getShowCChordWindow, getCChordWindowSize} from '../../selectors/base';
import {getCcLayout} from '../../selectors/data';
import {updateShowCChordWindow, updateCChordWindowSize} from '../../actions';

const mapDispatchToProps = {updateShowCChordWindow, updateCChordWindowSize};

const mapStateToProps = state => ({
  show: getShowCChordWindow(state),
  windowSize: getCChordWindowSize(state),
  layout: getCcLayout(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {
      layout,
      windowSize: [windowWidth, windowHeight],
      show
    } = this.props;
    const {chords, groups} = layout;
    const [width, height] = [windowWidth, windowHeight - 20];
    return show ? (
      <PopupWindow
        ref={input => (this.container = input)}
        x={600}
        y={50}
        width={windowWidth}
        height={windowHeight}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onClose={() => this.props.updateShowCChordWindow(false)}
        onResize={(event, {width, height}) =>
          this.props.updateCChordWindowSize([width, height])
        }
      >
        <ZoomableSVG width={width} height={height}>
          <g transform={`translate(${width / 2} ${height / 2})`}>
            <g>
              {chords.map(d => <path key={d.key} d={d.path} fill={d.color} />)}
            </g>
            <g>
              {groups.map(d => <path key={d.key} d={d.path} fill={d.color} />)}
            </g>
          </g>
        </ZoomableSVG>
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
