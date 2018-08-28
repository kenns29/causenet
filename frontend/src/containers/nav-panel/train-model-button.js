import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Button, notification} from 'antd';
import {fetchModelList, requestTrainBayesianModel} from '../../actions';

const mapDispatchToProps = {
  fetchModelList,
  requestTrainBayesianModel
};

const mapStateToProps = state => ({});

class TrainModelButton extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      trainModelButton: {
        modelName: ''
      }
    };
  }
  render() {
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
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TrainModelButton);
