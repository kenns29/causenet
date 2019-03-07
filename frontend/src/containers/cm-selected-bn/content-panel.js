import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {line as d3Line, curveCardinal} from 'd3-shape';
import PopupWindow from '../../components/popup-window';
import {clipLine} from '../../utils';
import {
  getShowCmSelectedBnWindow,
  getCmSelectedBnWindowSize
} from '../../selectors/base';
import {
  getCmSelectedBnLayout,
  getRawCmSelectedBnFocusLink
} from '../../selectors/data';
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
  windowSize: getCmSelectedBnWindowSize(state),
  nodeLink: getCmSelectedBnLayout(state),
  focusLink: getRawCmSelectedBnFocusLink(state)
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
          {nodes.map(({id, x, y, width, height, data: {fname, cname}}) => (
            <circle
              key={id}
              cx={x}
              cy={y}
              r={Math.min(width, height) / 2}
              fill={id === focs || id === foct ? 'orange' : 'black'}
              onMouseOver={event => {
                const [x, y] = this._getEventMouse(event);
                this.setState({tooltip: {x, y, content: `${fname}, ${cname}`}});
              }}
              onMouseOut={() => this.setState({tooltip: null})}
            />
          ))}
        </g>
        <g>
          {edges.map(({source, target, points}) => {
            const clippedEnd = clipLine({
              line: points.slice(points.length - 2),
              clipLengths: [0, 5]
            });
            const clippedPoints = [
              ...points.slice(0, points.length - 1),
              clippedEnd[1]
            ];
            return (
              <path
                key={`${source.id}-${target.id}`}
                d={lineg(clippedPoints)}
                fill="none"
                stroke={
                  source.id === focs && target.id === foct ? 'orange' : 'black'
                }
                strokeWidth={1}
                markerEnd={`url(#${ID}-arrow-marker)`}
              />
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
          <svg width={width} height={height}>
            {this._renderMarker()}
            {this._renderNodeLink()}
          </svg>
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
