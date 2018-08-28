import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getNodeLinkViewOptions} from '../../selectors/data';
import {updateNodeLinkViewOptions} from '../../actions';

const mapDispatchToProps = {
  updateNodeLinkViewOptions
};

const mapStateToProps = state => ({
  nodeLinkViewOptions: getNodeLinkViewOptions(state)
});

class ToggleNodeLinkViewLabels extends PureComponent {
  render() {
    const {
      nodeLinkViewOptions: {showLabels}
    } = this.props;
    return (
      <div>
        <span>{`Show Node Link View Labels `}</span>
        <Switch
          checked={showLabels}
          onChange={checked =>
            this.props.updateNodeLinkViewOptions({showLabels: checked})
          }
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleNodeLinkViewLabels);
