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
    getEventMouse: event => [event.clientX, event.clientY],
    brushType: '2d' // 'x', 'y'
  };

  static propTypes = {
    selection: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    extent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    onBrushStart: PropTypes.func.isRequired,
    onBrush: PropTypes.func.isRequired,
    onBrushEnd: PropTypes.func.isRequired,
    getEventMouse: PropTypes.func.isRequired,
    brushType: PropTypes.string.isRequired
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
        // drag start move positions - [x, y]
        omove: null, // overlay move
        smove: null, // selection move
        lmove: null, // side move
        cmove: null // corner move
      }
    };
  }

  _renderOverlay() {
    const {
      extent: [[x0, y0], [x1, y1]],
      brushType
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
        onPointerDown={event => {
          event.target.setPointerCapture(event.pointerId);
          const [x, y] = this.props.getEventMouse(event);
          this.setState({drag: {omove: [x, y]}});
          this.props.onBrushStart({
            target: this,
            type: 'start',
            selection: this.state.selection,
            sourceEvent: event
          });
        }}
        onPointerMove={event => {
          if (this.state.drag.omove) {
            const [x, y] = this.props.getEventMouse(event);
            const [sx, sy] = this.state.drag.omove;
            let selection = this.state.selection;
            switch (brushType) {
            case '2d':
              selection = [
                [Math.min(sx, x), Math.min(sy, y)],
                [Math.max(sx, x), Math.max(sy, y)]
              ];
              break;
            case 'x':
              selection = [[Math.min(sx, x), y0], [Math.max(sx, x), y1]];
              break;
            case 'y':
              selection = [[x0, Math.min(sy, y)], [x1, Math.max(sy, y)]];
            }
            this.setState({selection});
            this.props.onBrush({
              target: this,
              type: 'brush',
              selection,
              sourceEvent: event
            });
          }
        }}
        onPointerUp={event => {
          this.setState({
            drag: {
              ...this.state.drag,
              omove: null,
              smove: null,
              lmove: null,
              cmove: null
            }
          });
          this.props.onBrushEnd({
            target: this,
            type: 'end',
            selection: this.state.selection,
            sourceEvent: event
          });
        }}
      />
    );
  }

  _renderSelection() {
    const {
      extent: [[ex0, ey0], [ex1, ey1]],
      brushType
    } = this.props;
    const {selection} = this.state;
    if (!selection) {
      return null;
    }
    const [[x0, y0], [x1, y1]] = selection;
    const [x, y, w, h] = [x0, y0, x1 - x0, y1 - y0];
    const xbf = x => Math.min(Math.max(x, ex0), ex1);
    const ybf = y => Math.min(Math.max(y, ey0), ey1);
    const sxbf = (x0, x1, dx) => {
      if (x0 + dx < ex0) {
        return [ex0, x1 + (ex0 - x0)];
      }
      if (x1 + dx > ex1) {
        return [x0 + (ex1 - x1), ex1];
      }
      return [x0 + dx, x1 + dx];
    };
    const sybf = (y0, y1, dy) => {
      if (y0 + dy < ey0) {
        return [ey0, y1 + (ey0 - y0)];
      }
      if (y1 + dy > ey1) {
        return [y0 + (ey1 - y1), ey1];
      }
      return [y0 + dy, y1 + dy];
    };

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
          onPointerDown={event => {
            event.target.setPointerCapture(event.pointerId);
            const [x, y] = this.props.getEventMouse(event);
            this.setState({drag: {smove: [x, y]}});
            this.props.onBrushStart({
              target: this,
              type: 'start',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
          onPointerMove={event => {
            if (this.state.drag.smove) {
              const [x, y] = this.props.getEventMouse(event);
              const [sx, sy] = this.state.drag.smove;
              const [dx, dy] = [x - sx, y - sy];
              const [mx0, mx1] = sxbf(x0, x1, dx);
              const [my0, my1] = sybf(y0, y1, dy);
              let selection = this.state.selection;
              switch (brushType) {
              case '2d':
                selection = [[mx0, my0], [mx1, my1]];
                break;
              case 'x':
                selection = [[mx0, y0], [mx1, y1]];
                break;
              case 'y':
                selection = [[x0, my0], [x1, my1]];
              }
              this.setState({selection, drag: {smove: [x, y]}});
              this.props.onBrush({
                target: this,
                type: 'brush',
                selection,
                sourceEvent: event
              });
            }
          }}
          onPointerUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
            this.props.onBrushEnd({
              target: this,
              type: 'end',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
        />
        <rect
          ref={input => (this.handleN = input)}
          className="handle handle--n"
          cursor="ns-resize"
          x={x - 5}
          y={y - 5}
          width={w + 10}
          height={10}
          onPointerDown={event => {
            event.target.setPointerCapture(event.pointerId);
            const [x, y] = this.props.getEventMouse(event);
            this.setState({drag: {lmove: [x, y]}});
            this.props.onBrushStart({
              target: this,
              type: 'start',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
          onPointerMove={event => {
            if (this.state.drag.lmove) {
              const [x, y] = this.props.getEventMouse(event);
              const [sx, sy] = this.state.drag.lmove;
              const dy = y - sy;
              const my = ybf(y0 + dy);
              const [my0, my1] = my < y1 ? [my, y1] : [y1, y1];
              let selection = this.state.selection;
              switch (brushType) {
              case '2d':
              case 'y':
                selection = [[x0, my0], [x1, my1]];
              }
              this.setState({selection, drag: {lmove: [x, y]}});
              this.props.onBrush({
                target: this,
                type: 'brush',
                selection: this.state.selection,
                sourceEvent: event
              });
              if (my >= y1) {
                this.handleS.setPointerCapture(event.pointerId);
              }
            }
          }}
          onPointerUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
            this.props.onBrushEnd({
              target: this,
              type: 'end',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
        />
        <rect
          ref={input => (this.handleE = input)}
          className="handle handle--e"
          cursor="ew-resize"
          x={x + w - 5}
          y={y - 5}
          width={10}
          height={h + 10}
          onPointerDown={event => {
            event.target.setPointerCapture(event.pointerId);
            const [x, y] = this.props.getEventMouse(event);
            this.setState({drag: {lmove: [x, y]}});
            this.props.onBrushStart({
              target: this,
              type: 'start',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
          onPointerMove={event => {
            if (this.state.drag.lmove) {
              const [x, y] = this.props.getEventMouse(event);
              const [sx, sy] = this.state.drag.lmove;
              const dx = x - sx;
              const mx = xbf(x1 + dx);
              const [mx0, mx1] = x0 < mx ? [x0, mx] : [x0, x0];
              let selection = this.state.selection;
              switch (brushType) {
              case '2d':
              case 'x':
                selection = [[mx0, y0], [mx1, y1]];
              }
              this.setState({selection, drag: {lmove: [x, y]}});
              this.props.onBrush({
                target: this,
                type: 'brush',
                selection,
                sourceEvent: event
              });
              if (x0 >= mx) {
                this.handleW.setPointerCapture(event.pointerId);
              }
            }
          }}
          onPointerUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
            this.props.onBrushEnd({
              target: this,
              type: 'end',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
        />
        <rect
          ref={input => (this.handleS = input)}
          className="handle handle--s"
          cursor="ns-resize"
          x={x - 5}
          y={y + h - 5}
          width={w + 10}
          height={10}
          onPointerDown={event => {
            event.target.setPointerCapture(event.pointerId);
            const [x, y] = this.props.getEventMouse(event);
            this.setState({drag: {lmove: [x, y]}});
            this.props.onBrushStart({
              target: this,
              type: 'start',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
          onPointerMove={event => {
            if (this.state.drag.lmove) {
              const [x, y] = this.props.getEventMouse(event);
              const [sx, sy] = this.state.drag.lmove;
              const dy = y - sy;
              const my = ybf(y1 + dy);
              const [my0, my1] = y0 < my ? [y0, my] : [y0, y0];
              let selection = this.state.selection;
              switch (brushType) {
              case '2d':
              case 'y':
                selection = [[x0, my0], [x1, my1]];
              }
              this.setState({selection, drag: {lmove: [x, y]}});
              this.props.onBrush({
                target: this,
                type: 'brush',
                selection,
                sourceEvent: event
              });
              if (y0 >= my) {
                this.handleN.setPointerCapture(event.pointerId);
              }
            }
          }}
          onPointerUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
            this.props.onBrushEnd({
              target: this,
              type: 'end',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
        />
        <rect
          ref={input => (this.handleW = input)}
          className="handle handle--w"
          cursor="ew-resize"
          x={x - 5}
          y={y - 5}
          width={10}
          height={h + 10}
          onPointerDown={event => {
            event.target.setPointerCapture(event.pointerId);
            const [x, y] = this.props.getEventMouse(event);
            this.setState({drag: {lmove: [x, y]}});
            this.props.onBrushStart({
              target: this,
              type: 'start',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
          onPointerMove={event => {
            if (this.state.drag.lmove) {
              const [x, y] = this.props.getEventMouse(event);
              const [sx, sy] = this.state.drag.lmove;
              const dx = x - sx;
              const mx = xbf(x0 + dx);
              const [mx0, mx1] = mx <= x1 ? [mx, x1] : [x1, x1];
              let selection = this.state.selection;
              switch (brushType) {
              case '2d':
              case 'x':
                selection = [[mx0, y0], [mx1, y1]];
              }
              this.setState({selection, drag: {lmove: [x, y]}});
              this.props.onBrush({
                target: this,
                type: 'brush',
                selection,
                sourceEvent: event
              });
              if (mx >= x1) {
                this.handleE.setPointerCapture(event.pointerId);
              }
            }
          }}
          onPointerUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
            this.props.onBrushEnd({
              target: this,
              type: 'end',
              selection: this.state.selection,
              sourceEvent: event
            });
          }}
        />
        <rect
          className="handle handle--nw"
          cursor="nwse-resize"
          x={x - 5}
          y={y - 5}
          width={10}
          height={10}
          onPointerDown={event => {
            event.target.setPointerCapture(event.pointerId);
            const [x, y] = this.props.getEventMouse(event);
            this.setState({drag: {move: [x, y]}});
          }}
          onPointerMove={event => {
            if (this.state.drag.move) {
              const [x, y] = this.props.getEventMouse(event);
              const [sx, sy] = this.state.drag.move;
              const [dx, dy] = [x - sx, y - sy];
              switch (brushType) {
              case '2d':
                this.setState({
                  selection: [[x0, y0], [xbf(x1 + dx), ybf(y1 + dy)]]
                });
                break;
              case 'x':
                this.setState({
                  selection: [[xbf(x0 + dx), y0], [xbf(x1 + dx), y1]]
                });
                break;
              case 'y':
                this.setState({
                  selection: [[x0, ybf(y0 + dy)], [x1, ybf(y1 + dy)]]
                });
              }
            }
          }}
          onPointerUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
          }}
        />
        <rect
          className="handle handle--ne"
          cursor="nesw-resize"
          x={x + w - 5}
          y={y - 5}
          width={10}
          height={10}
          onMouseUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
          }}
        />
        <rect
          className="handle handle--se"
          cursor="nwse-resize"
          x={x + w - 5}
          y={y + h - 5}
          width={10}
          height={10}
          onMouseUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
          }}
        />
        <rect
          className="handle handle--sw"
          cursor="nesw-resize"
          x={x - 5}
          y={y + h - 5}
          width={10}
          height={10}
          onMouseUp={event => {
            this.setState({
              drag: {
                ...this.state.drag,
                omove: null,
                smove: null,
                lmove: null,
                cmove: null
              }
            });
          }}
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
