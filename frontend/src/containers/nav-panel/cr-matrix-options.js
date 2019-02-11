import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Switch} from 'antd';
import {getRawCrMatrixOptions} from '../../selectors/data';
import {updateCrMatrixOptions} from '../../actions';

const mapDispatchToProps = {
  updateCrMatrixOptions
};

const mapStateToProps = state => ({
  crMatrixOptions: getRawCrMatrixOptions(state)
});

class CrMatrixOptions extends PureComponent {
  render() {
    const {crMatrixOptions} = this.props;
    return (
      <React.Fragment>
        <div>
          <span>{`Show Row Network`}</span>
          <Switch
            checked={crMatrixOptions.showRowNetwork}
            onChange={checked =>
              this.props.updateCrMatrixOptions({
                ...crMatrixOptions,
                showRowNetwork: checked
              })
            }
          />
        </div>
        <div>
          <span>{`Show Col Network`}</span>
          <Switch
            checked={crMatrixOptions.showColNetwork}
            onChange={checked =>
              this.props.updateCrMatrixOptions({
                ...crMatrixOptions,
                showColNetwork: checked
              })
            }
          />
        </div>
        <div>
          <span>{`Show Cross Network`}</span>
          <Switch
            checked={crMatrixOptions.showCrossNetwork}
            onChange={checked =>
              this.props.updateCrMatrixOptions({
                ...crMatrixOptions,
                showCrossNetwork: checked
              })
            }
          />
        </div>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CrMatrixOptions);
