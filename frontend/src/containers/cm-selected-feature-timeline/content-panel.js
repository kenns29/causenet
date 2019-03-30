import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {line as d3Line, curveCardinal} from 'd3-shape';
import PopupWindow from '../../components/popup-window';
import SVGBrush from '../../components/svg-brush';
import {
  getShowCmSelectedFeatureTimelineWindow,
  getCmSelectedFeatureTimelineWindowSize,
  getPopupWindowOrder
} from '../../selectors/base';
import {
  getCmTimelineViewLayout,
  getCmTimelineMargins,
  getCmTimelineLayoutSize
} from '../../selectors/data';
import {
  updateShowCmSelectedFeatureTimelineWindow,
  updateCmSelectedFeatureTimelineWindowSize,
  updatePopupWindowOrder
} from '../../actions';

const mapDispatchToProps = {
  updateShowCmSelectedFeatureTimelineWindow,
  updateCmSelectedFeatureTimelineWindowSize,
  updatePopupWindowOrder
};

const mapStateToProps = state => ({
  show: getShowCmSelectedFeatureTimelineWindow(state),
  windowSize: getCmSelectedFeatureTimelineWindowSize(state),
  layout: getCmTimelineViewLayout(state),
  layoutSize: getCmTimelineLayoutSize(state),
  margins: getCmTimelineMargins(state),
  popupWindowOrder: getPopupWindowOrder(state)
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
const NAME = 'CmSelectedFeatureTimeline';

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
          <path
            key={d.id}
            d={d.path}
            fill="none"
            strokeWidth={1}
            stroke={d.color}
          />
        ))}
      </g>
    );
  }

  _renderYearAxis() {
    const {
      layout: {yearTicks},
      layoutSize: [width, height],
      margins: [ml, mt, mr, mb]
    } = this.props;
    if (!yearTicks) {
      return null;
    }
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
        {yearTicks.map(({value, position: [x, y]}) => (
          <line
            key={value}
            x1={x}
            y1={y}
            x2={x}
            y2={y + 5}
            stroke="black"
            strokeWidth={1}
          />
        ))}
        {yearTicks.map(({value, position: [x, y], label}) => (
          <text
            key={value}
            textAnchor="middle"
            alignmentBaseline="hanging"
            x={x}
            y={y + 8}
            color="black"
          >
            {label}
          </text>
        ))}
      </g>
    );
  }

  _renderTradeAxis() {
    const {
      layout: {tradeTicks},
      layoutSize: [width, height],
      margins: [ml, mt, mr, mb]
    } = this.props;
    if (!tradeTicks) {
      return null;
    }
    return (
      <g>
        <line
          x1={ml}
          y1={mt + height}
          x2={ml}
          y2={mt}
          stroke="black"
          strokeWidth={1}
        />
        {tradeTicks.map(({position: [x, y]}, index) => (
          <line
            key={index}
            x1={x}
            y1={y}
            x2={x - 5}
            y2={y}
            stroke="black"
            strokeWidth={1}
          />
        ))}
        {tradeTicks.map(({position: [x, y], label}, index) => (
          <text
            key={index}
            textAnchor="end"
            alignmentBaseline="middle"
            x={x - 8}
            y={y}
            color="black"
          >
            {label}
          </text>
        ))}
      </g>
    );
  }

  _renderStabilityAxis() {
    const {
      layout: {stabilityTicks},
      layoutSize: [width, height],
      margins: [ml, mt, mr, mb]
    } = this.props;
    if (!stabilityTicks) {
      return null;
    }
    return (
      <g>
        <line
          x1={ml + width}
          y1={mt + height}
          x2={ml + width}
          y2={mt}
          stroke="black"
          strokeWidth={1}
        />
        {stabilityTicks.map(({position: [x, y]}, index) => (
          <line
            key={index}
            x1={x}
            y1={y}
            x2={x + 5}
            y2={y}
            stroke="black"
            strokeWidth={1}
          />
        ))}
        {stabilityTicks.map(({position: [x, y], label}, index) => (
          <text
            key={index}
            textAnchor="start"
            alignmentBaseline="middle"
            x={x + 8}
            y={y}
            color="black"
          >
            {label}
          </text>
        ))}
      </g>
    );
  }

  _renderLegend() {
    const {
      layout: {
        legend: {trade, stability}
      }
    } = this.props;
    return (
      <g>
        {[...trade, ...stability].map(
          ({
            id,
            position: [x, y],
            size: [w, h],
            label,
            textOffest,
            color,
            fontSize
          }) => (
            <React.Fragment key={id}>
              <rect x={x} y={y} width={w} height={h} fill={color} />
              <text
                x={x + w + textOffest}
                y={y + h / 2}
                style={{alignmentBaseline: 'middle', fontSize}}
              >
                {label}
              </text>
            </React.Fragment>
          )
        )}
      </g>
    );
  }

  _renderBrush() {
    const {
      layoutSize: [width, height],
      margins: [ml, mt, mr, mb]
    } = this.props;
    return (
      <SVGBrush
        extent={[[ml, mt], [ml + width, mt + height]]}
        getEventMouse={event => {
          const {clientX, clientY} = event;
          const {left, top} = this.svg.getBoundingClientRect();
          return [clientX - left, clientY - top];
        }}
        brushType="2d"
      />
    );
  }

  render() {
    const {
      show,
      windowSize: [windowWidth, windowHeight],
      popupWindowOrder
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
        onClose={() =>
          this.props.updateShowCmSelectedFeatureTimelineWindow(false)
        }
        onResize={(event, {width, height}) =>
          this.props.updateCmSelectedFeatureTimelineWindowSize([width, height])
        }
        onClick={() =>
          popupWindowOrder[popupWindowOrder.length - 1] === NAME ||
          this.props.updatePopupWindowOrder([
            ...popupWindowOrder.filter(d => d !== NAME),
            NAME
          ])
        }
      >
        <svg ref={input => (this.svg = input)} width={width} height={height}>
          {this._renderTimelines()}
          {this._renderYearAxis()}
          {this._renderTradeAxis()}
          {this._renderStabilityAxis()}
          {this._renderLegend()}
          {this._renderBrush()}
        </svg>
        {this._renderTooltip()}
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
