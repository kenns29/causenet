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
  getMtPreFilteredCategories
} from '../../selectors/data';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
  modelList: getModelList(state),
  model: getRawMtSelectedModel(state),
  categories: getMtCategories(state),
  features: getMtFeatures(state),
  elements: getMtElements(state),
  pfCategories: getMtPreFilteredCategories(state),
  pfFeatures: getMtPreFilteredFeatures(state),
  pfElements: getMtPreFilteredElements(state)
});

const computeTextLength = makeTextLengthComputer({fontSize: 13});

class ModelTuning extends PureComponent {
  render() {
    const {
      width,
      height,
      modelList,
      model,
      categories,
      features,
      elements,
      pfCategories,
      pfFeatures,
      pfElements
    } = this.props;

    const fsui = [
      {
        key: 'categories',
        name: 'Categories',
        items: categories,
        pfItems: pfCategories
      },
      {
        key: 'features',
        name: 'Features',
        items: features,
        pfItems: pfFeatures
      },
      {
        key: 'elements',
        name: 'Elements',
        items: elements,
        pfItems: pfElements
      }
    ];
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
          <div>
            {fsui.map(({key, name, items, pfItems}) => {
              const itemh = estimateDivHeight(
                items.map(d => [
                  computeTextLength(d.name.slice(0, 6)) + 24,
                  26
                ]),
                350
              );

              return (
                <DragDropContext key={key} onDragEnd={() => {}}>
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
                        </div>
                      )}
                    </Droppable>
                    <Droppable droppableId={`${key}-pfitems`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          style={{
                            width: 80,
                            height: Math.min(itemh, 200),
                            marginLeft: 10,
                            position: 'relative',
                            overflow: 'auto'
                          }}
                        >
                          {pfItems.map(d => (
                            <Tag key={d.id}>{d.name.slice(0, 6)}</Tag>
                          ))}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </DragDropContext>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelTuning);
