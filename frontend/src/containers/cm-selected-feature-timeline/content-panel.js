import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {scaleLinear} from 'd3-scale';
import {config} from 'react-spring';
import {Spring} from 'react-spring/renderprops';
import {filterObject} from '../../utils';
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
  getCmTimelineLayoutSize,
  getCmTimelineYearDomain,
  getCmTimelineFeatures
} from '../../selectors/data';
import {
  updateShowCmSelectedFeatureTimelineWindow,
  updateCmSelectedFeatureTimelineWindowSize,
  updatePopupWindowOrder,
  updateShowTradeEventListWindw,
  bundleFetchUpdateTeData
} from '../../actions';

const mapDispatchToProps = {
  updateShowCmSelectedFeatureTimelineWindow,
  updateCmSelectedFeatureTimelineWindowSize,
  updatePopupWindowOrder,
  updateShowTradeEventListWindw,
  bundleFetchUpdateTeData
};

const mapStateToProps = state => ({
  show: getShowCmSelectedFeatureTimelineWindow(state),
  windowSize: getCmSelectedFeatureTimelineWindowSize(state),
  layout: getCmTimelineViewLayout(state),
  layoutSize: getCmTimelineLayoutSize(state),
  yearDomain: getCmTimelineYearDomain(state),
  margins: getCmTimelineMargins(state),
  popupWindowOrder: getPopupWindowOrder(state),
  features: getCmTimelineFeatures(state)
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

// const ID = 'cm-selected-feature-timeline';
const NAME = 'CmSelectedFeatureTimeline';

const WrappedBrush = props => {
  const {x0, y0, x1, y1, empty} = props;
  const s = new Set(['x0', 'y0', 'x1', 'y1', 'empty']);
  const selection = empty ? null : [[x0, y0], [x1, y1]];
  return (
    <SVGBrush {...{...filterObject(props, key => !s.has(key)), selection}} />
  );
};

class ContentPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: null,
      brushSelection: null,
      interBrushSelection: null
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
      margins: [ml, mt]
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
      layoutSize: [, height],
      margins: [ml, mt]
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
      margins: [ml, mt]
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
      margins: [ml, mt],
      yearDomain,
      features
    } = this.props;
    const {brushSelection, interBrushSelection} = this.state;
    if (!yearDomain) {
      return null;
    }
    const [source, target] = features;
    const scale = scaleLinear()
      .domain(yearDomain)
      .range([ml, ml + width]);

    const fs = interBrushSelection || brushSelection;
    const ts = brushSelection;
    const [[fx0, fy0], [fx1, fy1]] = fs || [[0, 0], [0, 0]];
    const [[tx0, ty0], [tx1, ty1]] = ts || [[0, 0], [0, 0]];
    return (
      <Spring
        from={{x0: fx0, y0: fy0, x1: fx1, y1: fy1}}
        to={{x0: tx0, y0: ty0, x1: tx1, y1: ty1}}
        immediate={!interBrushSelection}
      >
        {props => (
          <WrappedBrush
            extent={[[ml, mt], [ml + width, mt + height]]}
            getEventMouse={event => {
              const {clientX, clientY} = event;
              const {left, top} = this.svg.getBoundingClientRect();
              return [clientX - left, clientY - top];
            }}
            brushType="x"
            x0={props.x0}
            y0={props.y0}
            x1={props.x1}
            y1={props.y1}
            empty={!brushSelection}
            onBrush={({selection}) => {
              this.setState({
                brushSelection: selection,
                interBrushSelection: null
              });
            }}
            onBrushEnd={({selection}) => {
              if (!selection) {
                return;
              }
              const [[x0, y0], [x1, y1]] = selection;
              let [v0, v1] = [x0, x1].map(scale.invert).map(Math.round);
              v1 = v0 === v1 ? v1 + 1 : v1;
              const [rx0, rx1] = [v0, v1].map(scale);
              this.setState({
                brushSelection: [[rx0, y0], [rx1, y1]],
                interBrushSelection: [[x0, y0], [x1, y1]]
              });
              this.props.updateShowTradeEventListWindw(true);
              this.props.bundleFetchUpdateTeData({
                source,
                target,
                yearRange: [v0, v1]
              });
            }}
          />
        )}
      </Spring>
    );
  }

  render() {
    const {
      show,
      windowSize: [windowWidth, windowHeight],
      popupWindowOrder
    } = this.props;
    const [width, height] = [windowWidth, windowHeight - 25];
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
        onMouseDown={() =>
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
