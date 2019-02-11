import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PopupWindow from '../../components/popup-window';
import DeckGLContainer from './deckgl-container';
import {getShowBayesianNetworkSubNetworkDetailWindow} from '../../selectors/base';
import {getSelectedSubBayesianNetworkNodeLinkLayout} from '../../selectors/data';
import {updateShowBayesianNetworkSubNetworkDetailWindow} from '../../actions';

const mapDispatchToProps = {updateShowBayesianNetworkSubNetworkDetailWindow};

const mapStateToProps = state => ({
  show: getShowBayesianNetworkSubNetworkDetailWindow(state),
  nodeLink: getSelectedSubBayesianNetworkNodeLinkLayout(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    return {
      position: 'relative'
    };
  }
  get containerSize() {
    const {
      size: [width, height]
    } = this.state;
    return [width, height - 20];
  }
  constructor(props) {
    super(props);
    this.state = {
      size: [600, 620]
    };
  }

  render() {
    const {show} = this.props;
    const {
      size: [width, height]
    } = this.state;
    const [containerWidth, containerHeight] = this.containerSize;

    return show ? (
      <PopupWindow
        x={1000}
        y={200}
        width={width}
        height={height}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
        onResize={(event, {width, height}) =>
          this.setState({size: [width, height]})
        }
        onClose={() =>
          this.props.updateShowBayesianNetworkSubNetworkDetailWindow(false)
        }
      >
        <DeckGLContainer
          {...this.props}
          width={containerWidth}
          height={containerHeight}
        />
      </PopupWindow>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
