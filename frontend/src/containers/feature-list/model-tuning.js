import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Select, Tag, Divider, Button, Radio, Icon, Input, Alert} from 'antd';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {estimateDivHeight, makeTextLengthComputer} from '../../utils';
import {
  getModelList,
  getRawMtSelectedModel,
  getMtFF,
  getMtFC,
  getMtFU,
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
  fullFeatures: getMtFF(state),
  fullCategories: getMtFC(state),
  fullElements: getMtFU(state),
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
      position: 'relative',
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      border: '1px solid lightgray',
      borderRadius: '4px',
      overflow: 'auto'
    };

    const transferButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      whiteSpace: 'nowrap',
      border: '1px solid lightgray',
      borderRadius: '4px',
      cursor: 'pointer'
    };

    const {
      fullCategories,
      fullFeatures,
      fullElements,
      categories,
      features,
      elements,
      pfCategories,
      pfFeatures,
      pfElements,
      width
    } = this.props;

    const boxWidth = Math.min(Math.max((width - 120 - 30) / 2 - 10, 50), 350);

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
              width: boxWidth,
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
              width: boxWidth,
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
              boxWidth
            ) + 4;

          const pfitemh =
            estimateDivHeight(
              pfItems.map(d => [
                computeTextLength(d.name.slice(0, 6)) + 24,
                26
              ]),
              boxWidth
            ) + 4;

          const height = Math.max(
            Math.min(itemh, 200),
            Math.min(pfitemh, 200),
            50
          );

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
                    u: elements.map(d => d.id),
                    t: [-1]
                  };
                if (source.droppableId === `${key}-items`) {
                  const {id} = items[source.index];
                  nmod[key] = nmod[key].filter(d => d !== id);
                } else if (source.droppableId === `${key}-pfitems`) {
                  const {id} = pfItems[source.index];
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
                        width: boxWidth,
                        height,
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
                <div
                  style={{
                    width: 30,
                    height,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      ...transferButtonStyle
                    }}
                    onClick={event => {
                      const {mod} = this.props;
                      const nmod = mod
                        ? {...mod}
                        : {
                          f: features.map(d => d.id),
                          c: categories.map(d => d.id),
                          u: elements.map(d => d.id),
                          t: [-1]
                        };
                      nmod[key] = [];
                      this.props.updateMtModelMod(nmod);
                    }}
                  >
                    {'>'}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      width: 20,
                      height: 20,
                      ...transferButtonStyle
                    }}
                    onClick={event => {
                      const {mod} = this.props;
                      const fmod = {
                        f: fullFeatures.map(d => d.id),
                        c: fullCategories.map(d => d.id),
                        u: fullElements.map(d => d.id),
                        t: [-1]
                      };
                      const nmod = mod ? {...mod} : fmod;
                      nmod[key] = fmod[key];
                      this.props.updateMtModelMod(nmod);
                    }}
                  >
                    {'<'}
                  </div>
                </div>
                <Droppable droppableId={`${key}-pfitems`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={{
                        width: boxWidth,
                        height,
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

  _renderTargetRadio() {
    return (
      <div
        style={{display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center'}}
      >
        <span style={{marginLeft: 10}}>Target:</span>
        <Radio defaultChecked disabled style={{marginLeft: 10}}>
          Stability
        </Radio>
      </div>
    );
  }

  render() {
    const {height} = this.props;
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
          <Divider />
          {this._renderTargetRadio()}
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelTuning);
