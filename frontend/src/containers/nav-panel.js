import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Button, Switch, notification} from 'antd';
import ModelList from './model-list';
import {getNodeLinkViewOptions} from '../selectors/data';
import {
  fetchModelList,
  fetchBayesianNetwork,
  requestTrainBayesianModel,
  updateNodeLinkViewOptions
} from '../actions';

const mapDispatchToProps = {
  fetchModelList,
  fetchBayesianNetwork,
  requestTrainBayesianModel,
  updateNodeLinkViewOptions
};

const mapStateToProps = state => ({
  nodeLinkViewOptions: getNodeLinkViewOptions(state)
});

class NavPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      trainModelButton: {
        modelName: ''
      }
    };
  }
  _renderModelList() {
    return <ModelList />;
  }
  _renderTrainModelButton() {
    return (
      <div>
        <Input.Group compact>
          <Button
            type="primary"
            size="small"
            onClick={async event => {
              const {modelName} = this.state.trainModelButton;
              if (!modelName) {
                notification.error({message: 'Please specify a model name'});
              } else {
                await this.props.requestTrainBayesianModel({name: modelName});
                this.props.fetchModelList();
              }
            }}
          >
            Train Model
          </Button>
          <Input
            size="small"
            defaultValue={this.state.trainModelButton.modelName}
            style={{width: 100}}
            onChange={event =>
              this.setState({
                trainModelButton: {
                  ...this.state.trainModelButton,
                  modelName: event.target.value
                }
              })
            }
          />
        </Input.Group>
      </div>
    );
  }
  _renderToggleNodeLinkViewLabels() {
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
  render() {
    return (
      <div>
        {this._renderTrainModelButton()}
        {this._renderModelList()}
        {this._renderToggleNodeLinkViewLabels()}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavPanel);
