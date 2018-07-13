import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Button, notification} from 'antd';
import {fetchBayesianNetwork, requestTrainBayesianModel} from '../actions';

const mapDispatchToProps = {fetchBayesianNetwork, requestTrainBayesianModel};

const mapStateToProps = state => ({});

class NavPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      trainModelButton: {
        modelName: ''
      }
    };
  }
  _renderModelList() {}
  _renderTrainModelButton() {
    return (
      <div>
        <Input.Group compact>
          <Button
            type="primary"
            size="small"
            onClick={event => {
              const {modelName} = this.state.trainModelButton;
              if (!modelName) {
                notification.error({message: 'Please specify a model name'});
              } else {
                this.props.requestTrainBayesianModel({name: modelName});
              }
            }}
          >
            Train Model
          </Button>
          <Input
            size="small"
            defaultValue={this.state.trainModelButton.modelName}
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
  render() {
    return (
      <div>
        {this._renderTrainModelButton()}
        <Button
          type="primary"
          size="small"
          onClick={event => this.props.fetchBayesianNetwork({})}
        >
          Load Data
        </Button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavPanel);
