import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Rnd} from 'react-rnd';

const compareChanger = (changer1, changer2) =>
  !['width', 'height', 'x', 'y', 'show'].some(
    key => changer1[key] !== changer2[key]
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
    onClose: () => {}
  };
  static getDerivedStateFromProps(props, state) {
    const {width, height, x, y, show} = props;
    const newChanger = {width, height, x, y, show};
    const {changer} = state;
    if (compareChanger(newChanger, changer)) {
      return state;
    }
    return {
      ...state,
      ...newChanger,
      changer: newChanger
    };
  }
  constructor(props) {
    super(props);
    const {width, height, x, y, show} = props;
    const changer = {width, height, x, y, show};
    this.state = {...changer, changer};
  }
  render() {
    const {width, height, x, y, show} = this.state;
    const {headerHeight} = this.props;
    return show ? (
      <Rnd
        size={{width, height}}
        position={{x, y}}
        onDragStop={(_, {x, y}) => this.setState({x, y})}
        onResize={(event, direction, ref, delta, position) =>
          this.setState({width: ref.offsetWidth, height: ref.offsetHeight})
        }
        style={this.props.style}
      >
        <div style={{border: '1px solid grey', position: 'relative'}}>
          <div
            style={{
              backgroundColor: 'lightgrey',
              textAlign: 'right',
              verticalAlign: 'middle',
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
          style={{
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
