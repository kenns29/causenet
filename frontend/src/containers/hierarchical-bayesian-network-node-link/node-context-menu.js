import React, {PureComponent} from 'react';

export default class NodeContextMenu extends PureComponent {
  static defaultProps = {
    x: 0,
    y: 0,
    show: false
  };
  constructor(props) {
    super(props);
    this.state = {
      showDetail: {
        hovered: false
      }
    };
  }
  render() {
    const {x, y, show} = this.props;
    return show ? (
      <div
        id="node-context-menu"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          zIndex: 10,
          backgroundColor: 'white',
          border: '1px solid grey'
        }}
      >
        <div
          onMouseOver={event => this.setState({showDetail: {hovered: true}})}
          onMouseOut={event => this.setState({showDetail: {hovered: false}})}
          style={{
            cursor: 'pointer',
            backgroundColor: this.state.showDetail.hovered ? 'grey' : null
          }}
        >
          Show Detail
        </div>
      </div>
    ) : null;
  }
}
