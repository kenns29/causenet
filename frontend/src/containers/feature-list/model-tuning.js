import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Select, Tag, Divider, Button, Icon, Input, Alert} from 'antd';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {estimateDivHeight, makeTextLengthComputer} from '../../utils';
import {
  getModelList,
  getRawMtSelectedModel,
  getMtFeatures,
  getMtCategories,
  getMtElements,
  getMtPreFilteredElements,
  getMtPreFilteredFeatures,
  getMtPreFilteredCategories,
  getRawMtModelMod
} from '../../selectors/data';
import {
  updateMtSelectedModel,
  requestTrainBayesianModel,
  fetchMtModelMod,
  fetchModelList,
  updateMtModelMod
} from '../../actions';

const mapDispatchToProps = {
  updateMtSelectedModel,
  requestTrainBayesianModel,
  fetchMtModelMod,
  fetchModelList,
  updateMtModelMod
};

const mapStateToProps = state => ({
  modelList: getModelList(state),
  model: getRawMtSelectedModel(state),
  categories: getMtCategories(state),
  features: getMtFeatures(state),
  elements: getMtElements(state),
  pfCategories: getMtPreFilteredCategories(state),
  pfFeatures: getMtPreFilteredFeatures(state),
  pfElements: getMtPreFilteredElements(state),
  mod: getRawMtModelMod(state)
});

const computeTextLength = makeTextLengthComputer({fontSize: 13});

class ModelTuning extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newModel: '',
      alertProps: null
    };
  }

  _renderAlert() {
    const {alertProps} = this.state;
    return alertProps ? <Alert {...alertProps} /> : null;
  }

  _renderModelSelection() {
    const {modelList, model} = this.props;
    return (
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <span style={{marginLeft: 10, marginRight: 10}}> Model:</span>
        <Select
          showSearch
          placeholder="Select Model"
          value={model}
          style={{width: 150}}
          onChange={value => {
            if (value === 'None') {
              this.props.updateMtSelectedModel(null);
              this.props.updateMtModelMod(null);
            } else {
              this.props.updateMtSelectedModel(value);
              this.setState({
                newModel: value
              });
              this.props.fetchMtModelMod({name: value});
            }
          }}
        >
          {[...modelList, {name: 'None'}].map(d => (
            <Select.Option key={d.name} value={d.name}>
              {d.name}
            </Select.Option>
          ))}
        </Select>
        {this._renderArrow()}
        {this._renderNewModelNameInput()}
      </div>
    );
  }

  _renderArrow() {
    return (
      <div
        style={{
          marginLeft: 10,
          position: 'relative',
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            height: 20,
            width: 50,
            backgroundColor: 'lightblue'
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: '20px solid transparent',
            borderBottom: '20px solid transparent',
            borderLeft: '20px solid lightblue'
          }}
        />
      </div>
    );
  }

  _renderNewModelNameInput() {
    const {newModel} = this.state;
    return (
      <Input
        style={{marginLeft: 10, width: 100}}
        placeholder="To Model"
        value={newModel}
        onChange={event => this.setState({newModel: event.target.value})}
      />
    );
  }

  _renderTrainModelButton() {
    const {mod} = this.props;
    const {newModel} = this.state;
    return (
      <Button
        type="primary"
        style={{float: 'right', marginRight: 10}}
        onClick={async event => {
          if (newModel === '') {
            this.setState({
              alertProps: {
                message: 'Error',
                description: 'Please specify a name for the model.',
                type: 'error',
                showIcon: true,
                closable: true,
                onClose: () => this.setState({alertProps: null})
              }
            });
          } else {
            await this.props.requestTrainBayesianModel({name: newModel, mod});
            this.props.fetchModelList();
          }
        }}
      >
        Train Model
      </Button>
    );
  }

  _renderReloadButton() {
    const {model} = this.props;
    return (
      <Button
        type="default"
        style={{float: 'right', marginRight: 10}}
        onClick={event => {
          if (model === null) {
            this.props.updateMtModelMod(null);
          } else {
            this.props.fetchMtModelMod({name: model});
          }
        }}
      >
        Reload
      </Button>
    );
  }

  _renderFeatureSelectionUI() {
    const featureButtonStyle = {
      fontSize: 12,
      marginLeft: 8,
      marginTop: 2,
      padding: '2px 7px',
      backgroundColor: 'white',
      height: 24,
      whiteSpace: 'nowrap',
      border: '1px solid lightgray',
      borderRadius: '4px',
      cursor: 'pointer'
    };

    const featureBoxStyle = {
      marginLeft: 10,
      position: 'relative',
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      border: '1px solid lightgray',
      borderRadius: '4px',
      overflow: 'auto'
    };

    const {
      categories,
      features,
      elements,
      pfCategories,
      pfFeatures,
      pfElements
    } = this.props;

    const fsui = [
      {
        key: 'c',
        name: 'Categories',
        items: categories,
        pfItems: pfCategories
      },
      {
        key: 'f',
        name: 'Features',
        items: features,
        pfItems: pfFeatures
      },
      {
        key: 'u',
        name: 'Elements',
        items: elements,
        pfItems: pfElements
      }
    ];

    return (
      <div>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start'
          }}
        >
          <div
            style={{
              position: 'relative',
              marginLeft: 120,
              width: 350,
              height: 30,
              textAlign: 'center',
              padding: '5px 0px'
            }}
          >
            Selected
          </div>
          <div
            style={{
              position: 'relative',
              marginLeft: 10,
              width: 100,
              height: 30,
              textAlign: 'center',
              padding: '5px 0px'
            }}
          >
            Filtered
          </div>
        </div>
        {fsui.map(({key, name, items, pfItems}) => {
          const itemh =
            estimateDivHeight(
              items.map(d => [computeTextLength(d.name.slice(0, 6)) + 24, 26]),
              350
            ) + 4;

          return (
            <DragDropContext
              key={key}
              onDragEnd={result => {
                const {source, destination} = result;
                if (
                  !destination ||
                  source.droppableId === destination.droppableId ||
                  source.droppableId.split('-')[0] !==
                    destination.droppableId.split('-')[0]
                ) {
                  return;
                }
                const {mod} = this.props;
                const nmod = mod
                  ? {...mod}
                  : {
                    f: features.map(d => d.id),
                    c: categories.map(d => d.id),
                    u: elements.map(d => d.id)
                  };
                if (source.droppableId === `${key}-items`) {
                  const {id, name} = items[source.index];
                  nmod[key] = nmod[key].filter(d => d !== id);
                } else if (source.droppableId === `${key}-pfitems`) {
                  const {id, name} = pfItems[source.index];
                  nmod[key].push(id);
                }
                this.props.updateMtModelMod(nmod);
              }}
            >
              <div
                key={key}
                style={{
                  marginTop: 10,
                  position: 'relative',
                  display: 'flex',
                  flexWrap: 'wrap'
                }}
              >
                <div
                  style={{
                    width: 100,
                    marginLeft: 10,
                    position: 'relative'
                  }}
                >
                  {name}
                </div>
                <Droppable droppableId={`${key}-items`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={{
                        width: 350,
                        height: Math.min(itemh, 200),
                        ...featureBoxStyle
                      }}
                    >
                      {items.map((d, i) => (
                        <Draggable
                          key={d.id}
                          draggableId={d.id.toString()}
                          index={i}
                          direction="horizontal"
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...featureButtonStyle,
                                ...provided.draggableProps.style
                              }}
                            >
                              {d.name.slice(0, 6)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <Droppable droppableId={`${key}-pfitems`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={{
                        width: 100,
                        height: Math.min(itemh, 200),
                        ...featureBoxStyle
                      }}
                    >
                      {pfItems.map((d, i) => (
                        <Draggable
                          key={d.id}
                          draggableId={d.id.toString()}
                          index={i}
                          direction="horizontal"
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...featureButtonStyle,
                                ...provided.draggableProps.style
                              }}
                            >
                              {d.name.slice(0, 6)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          );
        })}
      </div>
    );
  }

  render() {
    const {width, height} = this.props;
    return (
      <div style={{overflowY: 'auto', overflowX: 'hidden', height}}>
        {this._renderAlert()}
        <div style={{position: 'relative'}}>
          {this._renderModelSelection()}
          {this._renderReloadButton()}
          {this._renderTrainModelButton()}
        </div>
        <Divider />
        <div
          style={{
            height: height - 90,
            overflow: 'auto',
            position: 'relative'
          }}
        >
          {this._renderFeatureSelectionUI()}
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelTuning);
