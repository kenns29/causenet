import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Button, notification} from 'antd';
import {
  fetchModelList,
  requestTrainClusterBayesianModel,
  requestTrainSubBayesianModelsWithinCluster
} from '../../actions';
import {getHierarchicalClusteringCutClusters} from '../../selectors/data';

const mapDispatchToProps = {
  fetchModelList,
  requestTrainClusterBayesianModel,
  requestTrainSubBayesianModelsWithinCluster
};

const mapStateToProps = state => ({
  clusters: getHierarchicalClusteringCutClusters(state)
});

class TrainClusterModelButton extends PureComponent {
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
              const {cluster} = this.props;
              if (!modelName) {
                notification.error({message: 'Please specify a model name'});
              } else {
                await this.props.requestTrainClusterBayesianModel({
                  name: modelName,
                  cluster
                });
                await this.props.requestTrainSubBayesianModelsWithinCluster({
                  name: modelName,
                  cluster
                });
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
)(TrainClusterModelButton);
