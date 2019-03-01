import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import PopupWindow from '../../components/popup-window';
import {getCcLayout} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  layout: getCcLayout(state)
});

class ContentPanel extends PureComponent {
  render() {
    const {layout} = this.props;
    const {chords, groups} = layout;
    const [width, height] = [800, 780];
    return (
      <PopupWindow
        ref={input => (this.container = input)}
        x={600}
        y={50}
        width={width}
        height={height + 20}
        style={{zIndex: 99, boxShadow: '10px 10px 5px grey'}}
      >
        <UncontrolledReactSVGPanZoom width={width} height={height}>
          <svg width={width} height={height}>
            <g transform={`translate(${width / 2} ${height / 2})`}>
              <g>
                {chords.map(d => (
                  <path key={d.key} d={d.path} fill={d.color} />
                ))}
              </g>
              <g>
                {groups.map(d => (
                  <path key={d.key} d={d.path} fill={d.color} />
                ))}
              </g>
            </g>
          </svg>
        </UncontrolledReactSVGPanZoom>
      </PopupWindow>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
