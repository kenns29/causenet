import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Select, Tag, Divider} from 'antd';
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
import {updateMtSelectedModel, updateMtModelMod} from '../../actions';

const mapDispatchToProps = {updateMtSelectedModel, updateMtModelMod};

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
  _renderFeatureSelectionUI() {
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
        {fsui.map(({key, name, items, pfItems}) => {
          const itemh = estimateDivHeight(
            items.map(d => [computeTextLength(d.name.slice(0, 6)) + 24, 26]),
            350
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
                const nmod = mod || {
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
                this.props.updateMtModelMod({...nmod});
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
                        marginLeft: 10,
                        position: 'relative',
                        display: 'flex',
                        flexWrap: 'wrap',
                        overflow: 'auto'
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
                                fontSize: 12,
                                marginLeft: 8,
                                marginTop: 2,
                                padding: '2px 7px',
                                backgroundColor: 'white',
                                height: 24,
                                whiteSpace: 'nowrap',
                                border: '1px solid lightgray',
                                borderRadius: '4px',
                                cursor: 'pointer',
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
                        marginLeft: 10,
                        position: 'relative',
                        display: 'flex',
                        flexWrap: 'wrap',
                        overflow: 'auto'
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
                                fontSize: 12,
                                marginLeft: 8,
                                marginTop: 2,
                                padding: '2px 7px',
                                backgroundColor: 'white',
                                height: 24,
                                whiteSpace: 'nowrap',
                                border: '1px solid lightgray',
                                borderRadius: '4px',
                                cursor: 'pointer',
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
    const {width, height, modelList, model} = this.props;

    return (
      <React.Fragment>
        <div style={{height: 20, position: 'relative'}}>
          <span> Model: </span>
          <Select style={{width: 150}}>
            {modelList.map(d => (
              <Select.Option key={d.name} value={d.name}>
                {d.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Divider />
        <div
          style={{
            height: height - 30,
            overflow: 'auto',
            position: 'relative'
          }}
        >
          {this._renderFeatureSelectionUI()}
        </div>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelTuning);
