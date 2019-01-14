import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  updateShowBayesianNetworkSubNetworkDetailWindow,
  updateSelectedSubBayesianNetworkId
} from '../../actions';

const mapDispatchToProps = {
  updateShowBayesianNetworkSubNetworkDetailWindow,
  updateSelectedSubBayesianNetworkId
};

const mapStateToProps = state => ({});

class NodeContextMenu extends PureComponent {
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
    const {x, y, show, data} = this.props;
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
          onClick={event => {
            this.props.updateShowBayesianNetworkSubNetworkDetailWindow(true);
            if (data) {
              this.props.updateSelectedSubBayesianNetworkId(data.id);
            }
          }}
        >
          Show Detail
        </div>
      </div>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeContextMenu);
