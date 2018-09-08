import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

export default class Tooltip extends PureComponent {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    style: PropTypes.object
  };
  render() {
    return (
      <div {...this.props}>
        {this.props.children &&
          React.Children.map(
            this.props.children,
            child => child && React.cloneElement(child)
          )}
      </div>
    );
  }
}
