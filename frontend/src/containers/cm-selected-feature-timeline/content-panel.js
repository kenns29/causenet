import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {line as d3Line, curveCardinal} from 'd3-shape';
import PopupWindow from '../../components/popup-window';
import {
  getShowCmSelectedFeatureTimelineWindow,
  getCmSelectedFeatureTimelineWindowSize
} from '../../selectors/base';
import {
  getCmTimelineViewLayout,
  getCmTimelineMargins,
  getCmTimelineLayoutSize
} from '../../selectors/data';
import {
  updateShowCmSelectedFeatureTimelineWindow,
  updateCmSelectedFeatureTimelineWindowSize
} from '../../actions';

const mapDispatchToProps = {
  updateShowCmSelectedFeatureTimelineWindow,
  updateCmSelectedFeatureTimelineWindowSize
};

const mapStateToProps = state => ({
  show: getShowCmSelectedFeatureTimelineWindow(state),
  windowSize: getCmSelectedFeatureTimelineWindowSize(state),
  layout: getCmTimelineViewLayout(state),
  layoutSize: getCmTimelineLayoutSize(state),
  margins: getCmTimelineMargins(state)
});

const tooltipStyle = {
  position: 'absolute',
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9,
  pointerEvents: 'none'
};

const ID = 'cm-selected-feature-timeline';

class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: null
    };
  }

  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.contentContainer.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };

  _renderTooltip() {
    const {tooltip} = this.state;
    if (tooltip) {
      const {content, x, y} = tooltip;
      return (
        <div style={{...tooltipStyle, left: x + 10, top: y - 20}}>
          {content}
        </div>
      );
    }
    return null;
  }

  _renderTimelines() {
    const {layout} = this.props;
    const {timelines} = layout;
    return (
      <g>
        {timelines.map(d => (
          <path d={d.path} fill="none" strokeWidth={1} stroke={d.color} />
        ))}
      </g>
    );
  }

  _renderYearAxis() {
    const {layout, layoutSize, margins} = this.props;
    const {yearTicks} = layout;
    if (!yearTicks) {
      return null;
    }
    const {width, height} = layoutSize;
    const [ml, mt, mr, mb] = margins;
    return (
      <g>
        <line
          x1={ml}
          y1={mt + height}
          x2={ml + width}
          y2={mt + height}
          stroke="black"
          strokeWidth={1}
        />
        {yearTicks.map(({position: [x, y]}) => (
          <line
            x1={x}
            y1={y}
            x2={x}
            y2={y + 5}
            stroke="black"
            strokeWidth={1}
          />
        ))}
        {yearTicks.map((value, position: [x, y]) => (
          <text
            textAnchor="middle"
            alignmentBaseline="top"
            x={x}
            y={y + 8}
            color="black"
          >
            {value}
          </text>
        ))}
      </g>
    );
  }

  _renderTradeAxis() {}

  render() {
    const {
      show,
      windowSize: [windowWidth, windowHeight]
    } = this.props;
    const [width, height] = [windowWidth, windowHeight - 20];
    console.log('width', width, 'height', height);
    return show ? (
      <PopupWindow
        ref={input => (this.container = input)}
        x={1500}
        y={50}
        width={windowWidth}
        height={windowHeight}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onClose={() =>
          this.props.updateShowCmSelectedFeatureTimelineWindow(false)
        }
        onResize={(event, {width, height}) =>
          this.props.updateCmSelectedFeatureTimelineWindowSize([width, height])
        }
      >
        <UncontrolledReactSVGPanZoom width={width} height={height}>
          <svg width={width} height={height} />
          {this._renderTimelines()}
          {this._renderYearAxis()}
        </UncontrolledReactSVGPanZoom>
        {this._renderTooltip()}
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
