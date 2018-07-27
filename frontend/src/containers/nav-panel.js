import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Button, Select, Switch, Slider, notification} from 'antd';
import ModelList from './model-list';
import {
  getCurrentDatasetName,
  getDatasetList,
  getNodeLinkViewOptions,
  getHierarchicalClusteringCutThreshold
} from '../selectors/data';
import {
  fetchModelList,
  fetchDistanceMap,
  fetchHierarchicalClusteringTree,
  updateHierarchicalClusteringCutThreshold,
  requestUpdateCurrentDatasetName,
  fetchBayesianNetwork,
  updateBayesianNetwork,
  updateSelectedModel,
  requestTrainBayesianModel,
  updateNodeLinkViewOptions
} from '../actions';

const mapDispatchToProps = {
  fetchModelList,
  fetchDistanceMap,
  fetchHierarchicalClusteringTree,
  updateHierarchicalClusteringCutThreshold,
  requestUpdateCurrentDatasetName,
  fetchBayesianNetwork,
  requestTrainBayesianModel,
  updateBayesianNetwork,
  updateSelectedModel,
  updateNodeLinkViewOptions
};

const mapStateToProps = state => ({
  nodeLinkViewOptions: getNodeLinkViewOptions(state),
  currentDatasetName: getCurrentDatasetName(state),
  datasetList: getDatasetList(state),
  hierarchicalClusteringCutThreshold: getHierarchicalClusteringCutThreshold(
    state
  )
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
  _renderDatasetSelect() {
    const {currentDatasetName, datasetList} = this.props;
    return (
      <div>
        <Input.Group compact>
          <span>Dataset: </span>
          <Select
            value={currentDatasetName}
            onChange={async name => {
              await this.props.requestUpdateCurrentDatasetName(name);
              await this.props.fetchModelList();
              await this.props.fetchDistanceMap();
              await this.props.fetchHierarchicalClusteringTree();
              this.props.updateSelectedModel(null);
              this.props.updateBayesianNetwork([]);
            }}
            style={{width: '50%'}}
          >
            {datasetList.map(name => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Input.Group>
      </div>
    );
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
  _renderHierachicalClusteringCutThresholdSlider() {
    const {hierarchicalClusteringCutThreshold} = this.props;
    return (
      <div>
        <span>{`Hierarchical Clustering Cut Threshold `}</span>
        <Slider
          min={0}
          max={2}
          step={0.1}
          defaultValue={hierarchicalClusteringCutThreshold}
          onChange={this.props.updateHierarchicalClusteringCutThreshold}
        />
      </div>
    );
  }
  render() {
    return (
      <div>
        {this._renderDatasetSelect()}
        {this._renderTrainModelButton()}
        {this._renderModelList()}
        {this._renderToggleNodeLinkViewLabels()}
        {this._renderHierachicalClusteringCutThresholdSlider()}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavPanel);
