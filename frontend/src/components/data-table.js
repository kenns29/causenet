// @flow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table, Button, Icon} from 'antd';

export default class DataTable extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    removeData: PropTypes.func.isRequired
  };
  static defaultProps = {
    data: [],
    removeData: () => {}
  };
  render() {
    const {data} = this.props;
    if (data.length === 0) {
      return <Table size="small" columns={[]} dataSource={data} />;
    }
    const columns = Object.keys(data[0])
      .filter(key => key !== 'key')
      .map(key => ({
        title: key,
        dataIndex: key,
        key
      }))
      .concat({
        title: 'Action',
        dataIndex: 'delete',
        key: 'delete',
        render: (text, record) => {
          return (
            <Button
              size="small"
              onClick={() => this.props.removeData(record.key)}
            >
              <Icon type="delete" />
            </Button>
          );
        }
      });
    return <Table size="small" columns={columns} dataSource={data} />;
  }
}
