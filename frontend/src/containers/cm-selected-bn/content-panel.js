import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import ZoomableSVG from '../../components/zoomable-svg';
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
      focusLink
    } = this.props;
    if (!focusLink) {
      return null;
    }
    const {source: focs, target: foct} = focusLink;
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
                  let content = `${fname}, ${cname}`;
                  if (cname !== 'stability') {
                    content += `, ${uname}`;
                  }
                  this.setState({tooltip: {x, y, content}});
                }}
                onMouseOut={() => this.setState({tooltip: null})}
              />
            )
          )}
        </g>
        <g>
          {edges.map(({source, target, points, corr, path, strokeWidth}) => {
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
                  strokeWidth={strokeWidth}
                  markerEnd={
                    corr > 0
                      ? strokeWidth > 2
                        ? `url(#${ID}-blue-arrow-marker-bg)`
                        : `url(#${ID}-blue-arrow-marker-sm)`
                      : strokeWidth > 2
                        ? `url(#${ID}-red-arrow-marker-bg)`
                        : `url(#${ID}-red-arrow-marker-sm)`
                  }
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
          id={`${ID}-blue-arrow-marker-sm`}
          refX="0"
          refY="3"
          markerUnits="userSpaceOnUse"
          markerWidth="9"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="blue" />
        </marker>
        <marker
          id={`${ID}-blue-arrow-marker-bg`}
          refX="0"
          refY="6"
          markerUnits="userSpaceOnUse"
          markerWidth="12"
          markerHeight="12"
          orient="auto"
        >
          <path d="M0,0 L0,12 L12,6 z" fill="blue" />
        </marker>
        <marker
          id={`${ID}-red-arrow-marker-sm`}
          refX="0"
          refY="3"
          markerUnits="userSpaceOnUse"
          markerWidth="9"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="red" />
        </marker>
        <marker
          id={`${ID}-red-arrow-marker-bg`}
          refX="0"
          refY="6"
          markerUnits="userSpaceOnUse"
          markerWidth="12"
          markerHeight="12"
          orient="auto"
        >
          <path d="M0,0 L0,12 L12,6 z" fill="red" />
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
