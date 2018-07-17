import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
export default class ZoomableContainer extends PureComponent {
  static defaultProps = {
    zoomStep: 0.1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };
  static propTypes = {
    zoomStep: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      zoomScale: 1,
      zoomOffset: [0, 0]
    };
  }
}
