import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Button, Select, Switch, notification} from 'antd';
import ModelList from './model-list';
import {
  getCurrentDatasetName,
  getDatasetList,
  getNodeLinkViewOptions
} from '../selectors/data';
import {
  fetchModelList,
  requestUpdateCurrentDatasetName,
  fetchBayesianNetwork,
  updateBayesianNetwork,
  updateSelectedModel,
  requestTrainBayesianModel,
  updateNodeLinkViewOptions
} from '../actions';

const mapDispatchToProps = {
  fetchModelList,
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
  datasetList: getDatasetList(state)
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
    console.log(
      'datasetList',
      datasetList,
      'currentDatasetName',
      currentDatasetName
    );
    return (
      <div>
        <Input.Group compact>
          <span>Dataset: </span>
          <Select
            value={currentDatasetName}
            onChange={async name => {
              await this.props.requestUpdateCurrentDatasetName(name);
              await this.props.fetchModelList();
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
  render() {
    return (
      <div>
        {this._renderDatasetSelect()}
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
