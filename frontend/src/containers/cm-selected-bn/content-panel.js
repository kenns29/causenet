import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {line as d3Line, curveCardinal} from 'd3-shape';
import PopupWindow from '../../components/popup-window';
import ZoomableSVG from '../../components/zoomable-svg';
import {clipLine} from '../../utils';
import {
  getShowCmSelectedBnWindow,
  getCmSelectedBnWindowSize,
  getPopupWindowOrder
} from '../../selectors/base';
import {
  getCmSelectedBnLayout,
  getRawCmSelectedBnFocusLink
} from '../../selectors/data';
import {
  updateShowCmSelectedBnWindow,
  updateCmSelectedBnWindowSize,
  updateShowCmSelectedFeatureTimelineWindow,
  bundleFetchUpdateCmSelectedFeatureTimelineData,
  updatePopupWindowOrder
} from '../../actions';

const mapDispatchToProps = {
  updateShowCmSelectedBnWindow,
  updateCmSelectedBnWindowSize,
  updateShowCmSelectedFeatureTimelineWindow,
  bundleFetchUpdateCmSelectedFeatureTimelineData,
  updatePopupWindowOrder
};

const mapStateToProps = state => ({
  show: getShowCmSelectedBnWindow(state),
  windowSize: getCmSelectedBnWindowSize(state),
  nodeLink: getCmSelectedBnLayout(state),
  focusLink: getRawCmSelectedBnFocusLink(state),
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

const ID = 'cm-selected-bn';
const NAME = 'CmSelectedBn';

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

  _renderNodeLink() {
    const {
      nodeLink: {nodes, edges},
      focusLink: {source: focs, target: foct}
    } = this.props;
    const lineg = d3Line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(curveCardinal);
    return (
      <g transform="translate(50 50)">
        <g>
          {nodes.map(
            ({id, x, y, width, height, data: {fname, cname, uname}}) => (
              <circle
                key={id}
                cx={x}
                cy={y}
                r={Math.min(width, height) / 2}
                fill={id === focs || id === foct ? 'orange' : 'black'}
                onMouseOver={event => {
                  const [x, y] = this._getEventMouse(event);
                  this.setState({
                    tooltip: {x, y, content: `${fname}, ${cname}, ${uname}`}
                  });
                }}
                onMouseOut={() => this.setState({tooltip: null})}
              />
            )
          )}
        </g>
        <g>
          {edges.map(({source, target, points, corr}) => {
            const clippedEnd = clipLine({
              line: points.slice(points.length - 2),
              clipLengths: [0, 5]
            });
            const clippedPoints = [
              ...points.slice(0, points.length - 1),
              clippedEnd[1]
            ];

            const path = lineg(clippedPoints);

            return (
              <React.Fragment key={`${source.id}-${target.id}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="white"
                  strokeWidth={5}
                  style={{cursor: 'pointer'}}
                  onClick={event => {
                    this.props.bundleFetchUpdateCmSelectedFeatureTimelineData({
                      featureSelection: [source.id, target.id]
                    });
                    this.props.updateShowCmSelectedFeatureTimelineWindow(true);
                  }}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={corr > 0 ? 'blue' : 'red'}
                  strokeWidth={1}
                  markerEnd={`url(#${ID}-arrow-marker)`}
                  style={{cursor: 'pointer'}}
                  onClick={event => {
                    this.props.bundleFetchUpdateCmSelectedFeatureTimelineData({
                      featureSelection: [source.id, target.id]
                    });
                    this.props.updateShowCmSelectedFeatureTimelineWindow(true);
                  }}
                />
              </React.Fragment>
            );
          })}
        </g>
      </g>
    );
  }
  _renderMarker() {
    return (
      <defs>
        <marker
          id={`${ID}-arrow-marker`}
          refX="0"
          refY="3"
          markerUnits="strokeWidth"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="black" />
        </marker>
      </defs>
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
        onClose={() => this.props.updateShowCmSelectedBnWindow(false)}
        onResize={(event, {width, height}) =>
          this.props.updateCmSelectedBnWindowSize([width, height])
        }
        onClick={() =>
          popupWindowOrder[popupWindowOrder.length - 1] === NAME ||
          this.props.updatePopupWindowOrder([
            ...popupWindowOrder.filter(d => d !== NAME),
            NAME
          ])
        }
      >
        <ZoomableSVG width={width} height={height}>
          {this._renderMarker()}
          {this._renderNodeLink()}
        </ZoomableSVG>
        {this._renderTooltip()}
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
