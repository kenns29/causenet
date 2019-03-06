import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {line as d3Line, curveCardinal} from 'd3-shape';
import PopupWindow from '../../components/popup-window';
import {
  getShowCmSelectedBnWindow,
  getCmSelectedBnWindowSize
} from '../../selectors/base';
import {getCmSelectedBnLayout} from '../../selectors/data';
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
  nodeLink: getCmSelectedBnLayout(state)
});

class ContentPanel extends PureComponent {
  _renderNodeLink() {
    const {
      nodeLink: {nodes, edges}
    } = this.props;
    const lineg = d3Line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(curveCardinal);
    return (
      <g transform="translate(50 50)">
        <g>
          {nodes.map(({id, x, y, width, height}) => (
            <circle
              key={id}
              cx={x}
              cy={y}
              r={Math.min(width, height) / 2}
              fill="black"
            />
          ))}
        </g>
        <g>
          {edges.map(({source, target, points}) => (
            <path
              key={`${source.id}-${target.id}`}
              d={lineg(points)}
              fill="none"
              stroke="black"
              strokeWidth={1}
            />
          ))}
        </g>
      </g>
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
            {this._renderNodeLink()}
          </svg>
        </UncontrolledReactSVGPanZoom>
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
