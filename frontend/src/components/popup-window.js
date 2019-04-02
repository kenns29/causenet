import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Rnd} from 'react-rnd';

const getChangerDiff = (c1, c2) =>
  ['width', 'height', 'x', 'y', 'show'].reduce(
    (m, k) => (c1[k] == c2[k] ? m : Object.assign(m, {[k]: c2[k]})),
    {}
  );

export default class PopupWindow extends PureComponent {
  static defaultProps = {
    width: 620,
    height: 420,
    x: 20,
    y: 20,
    style: {},
    headerStyle: {},
    contentStyle: {},
    headerHeight: 20,
    show: true,
    onClose: () => {},
    onDrag: () => {},
    onResize: () => {},
    onClick: () => {},
    onMouseDown: () => {},
    contentProps: {}
  };
  static getDerivedStateFromProps(props, state) {
    const {width, height, x, y, show} = props;
    const newChanger = {width, height, x, y, show};
    const {changer} = state;
    const diff = getChangerDiff(changer, newChanger);
    return {
      ...state,
      ...diff,
      changer: newChanger
    };
  }
  constructor(props) {
    super(props);
    const {width, height, x, y, show} = props;
    const changer = {width, height, x, y, show};
    this.state = {...changer, changer, start: null};
  }
  render() {
    const {width, height, x, y, show} = this.state;
    const {headerHeight} = this.props;
    return show ? (
      <Rnd
        size={{width, height}}
        position={{x, y}}
        dragHandleClassName="draggable"
        onDrag={(event, {x, y}) => {
          this.setState({x, y});
          this.props.onDrag(event, {x, y});
        }}
        onResize={(event, direction, ref, delta, position) => {
          const [x, y, width, height] = [
            position.x,
            position.y,
            ref.offsetWidth,
            ref.offsetHeight
          ];
          this.setState({
            x,
            y,
            width,
            height
          });
          this.props.onResize(
            event,
            {x, y, width, height},
            direction,
            ref,
            delta,
            position
          );
        }}
        style={this.props.style}
        onClick={this.props.onClick}
        onMouseDown={this.props.onMouseDown}
      >
        <div style={{position: 'relative'}}>
          <div
            className="header draggable"
            style={{
              position: 'relative',
              backgroundColor: 'lightgrey',
              textAlign: 'right',
              verticalAlign: 'middle',
              cursor: 'move',
              ...this.props.headerStyle,
              height: headerHeight,
              width
            }}
          >
            <span
              style={{
                color: 'blue',
                cursor: 'pointer',
                fontSize: 13,
                marginRight: 5
              }}
              onClick={event => {
                this.setState({show: false});
                this.props.onClose(event);
              }}
            >
              close
            </span>
          </div>
        </div>
        <div
          ref={input => (this.contentContainer = input)}
          {...this.props.contentProps}
          style={{
            position: 'relative',
            backgroundColor: 'white',
            overflowY: 'auto',
            ...this.props.contentStyle,
            width,
            height: height - headerHeight
          }}
        >
          {this.props.children &&
            React.Children.map(
              this.props.children,
              child => child && React.cloneElement(child)
            )}
        </div>
      </Rnd>
    ) : null;
  }
}
