import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {document} from 'global';

const compareSelections = (s1, s2) => {
  if (s1 === null && s2 === null) {
    return true;
  }
  if (s1 !== null && s2 !== null) {
    const [[px0, py0], [px1, py1]] = s1;
    const [[cx0, cy0], [cx1, cy1]] = s2;
    return [[px0, cx0], [py0, cy0], [px1, cx1], [py1, cy1]].every(
      ([p, c]) => p === c
    );
  }
  return false;
};

export default class SVGBrush extends PureComponent {
  static defaultProps = {
    selection: null,
    extent: [[0, 0], [1, 1]],
    onBrushStart: event => {},
    onBrush: event => {},
    onBrushEnd: event => {},
    getEventMouse: event => [event.clientX, event.clientY]
  };

  static propTypes = {
    selection: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    extent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
  };

  static getDerivedStateFromProps(props, state) {
    if (!compareSelections(props.selection, state.changer)) {
      return {
        ...state,
        selection: props.selection,
        changer: props.selection
      };
    }
    return state;
  }

  constructor(props) {
    super(props);
    this.state = {
      selection: null,
      changer: null,
      drag: {
        start: null // drag start move position - [x, y]
      }
    };
  }

  _renderOverlay() {
    const {
      extent: [[x0, y0], [x1, y1]]
    } = this.props;

    return (
      <rect
        className="overlay"
        pointerEvents="all"
        cursor="crosshair"
        fill="none"
        x={x0}
        y={y0}
        width={x1 - x0}
        height={y1 - y0}
        onMouseDown={event => {
          console.log('mouse down', this.state.drag.start);
          const [x, y] = this.props.getEventMouse(event);
          this.setState({drag: {start: [x, y]}});
        }}
        onMouseMove={event => {
          console.log('mouse move', this.state.drag.start);
          if (this.state.drag.start) {
            const [x, y] = this.props.getEventMouse(event);
            const [sx, sy] = this.state.drag.start;
            this.setState({
              selection: [
                [Math.min(sx, x), Math.min(sy, y)],
                [Math.max(sx, x), Math.max(sy, y)]
              ]
            });
          }
        }}
        onMouseUp={event => {
          console.log('mouse up', this.state.drag.start);
          this.setState({drag: {...this.state.drag, start: null}});
        }}
      />
    );
  }

  _renderSelection() {
    const {selection} = this.state;
    if (!selection) {
      return null;
    }
    const [[x0, y0], [x1, y1]] = selection;
    const [x, y, w, h] = [x0, y0, x1 - x0, y1 - y0];
    return (
      <React.Fragment>
        <rect
          className="selection"
          cursor="move"
          fill="#777"
          fillOpacity="0.3"
          stroke="#fff"
          shapeRendering="crispEdges"
          x={x}
          y={y}
          width={w}
          height={h}
          onMouseDown={event => {}}
        />
        <rect
          className="handle handle--n"
          cursor="ns-resize"
          x={x - 5}
          y={y - 5}
          width={w + 10}
          height={10}
        />
        <rect
          className="handle handle--e"
          cursor="ew-resize"
          x={x + w - 5}
          y={y - 5}
          width={10}
          height={h + 10}
        />
        <rect
          className="handle handle--s"
          cursor="ns-resize"
          x={x - 5}
          y={y + h - 5}
          width={w + 10}
          height={10}
        />
        <rect
          className="handle handle--w"
          cursor="ew-resize"
          x={x - 5}
          y={y - 5}
          width={10}
          height={h + 10}
        />
        <rect
          className="handle handle--nw"
          cursor="nwse-resize"
          x={x - 5}
          y={y - 5}
          width={10}
          height={10}
        />
        <rect
          className="handle handle--ne"
          cursor="nesw-resize"
          x={x + w - 5}
          y={y - 5}
          width={10}
          height={10}
        />
        <rect
          className="handle handle--se"
          cursor="nwse-resize"
          x={x + w - 5}
          y={y + h - 5}
          width={10}
          height={10}
        />
        <rect
          className="handle handle--sw"
          cursor="nesw-resize"
          x={x - 5}
          y={y + h - 5}
          width={10}
          height={10}
        />
      </React.Fragment>
    );
  }

  render() {
    return (
      <g className="brush">
        {this._renderOverlay()}
        {this._renderSelection()}
      </g>
    );
  }
}
