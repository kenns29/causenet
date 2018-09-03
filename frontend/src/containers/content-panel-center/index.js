import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Rnd} from 'react-rnd';
import {updateContentPanelCenter} from '../../actions';
import {
  getContentPanelCenterPosition,
  getContentPanelWidth,
  getContentPanelHeight
} from '../../selectors/base';

const mapDispatchToProps = {updateContentPanelCenter};

const mapStateToProps = state => ({
  position: getContentPanelCenterPosition(state),
  contentPanelWidth: getContentPanelWidth(state),
  contentPanelHeight: getContentPanelHeight(state)
});

const SIZE = [20, 20];
class ContentPanelCenter extends PureComponent {
  render() {
    const {
      position: [x, y],
      contentPanelWidth,
      contentPanelHeight
    } = this.props;
    const [width, height] = SIZE;
    return (
      <Rnd
        size={{width, height}}
        position={{x: x - width / 2, y: y - height / 2}}
        disableDragging={false}
        enableResizing={false}
        bounds="parent"
        style={{
          position: 'absolute'
        }}
        onDrag={(_, d) =>
          this.props.updateContentPanelCenter([
            (d.x + width / 2) / contentPanelWidth,
            (d.y + height / 2) / contentPanelHeight
          ])
        }
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanelCenter);
