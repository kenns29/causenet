import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {List} from 'antd';

const mapDispatchToProps = {};

const mapStateToProps = state => ({});

class EventList extends PureComponent {
  render() {
    const {eventList} = this.props;
    return eventList ? (
      <List>
        {eventList.map(d => (
          <List.Item>
            <div>{d.year}</div>
            <List.Item.Meta title={d.event_type} description={d.notes} />
          </List.Item>
        ))}
      </List>
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventList);
