// @flow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table, Button, Icon, Radio} from 'antd';

export default class DataTable extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    removeData: PropTypes.func.isRequired
  };
  static defaultProps = {
    data: [],
    removeData: () => {},
    checked: (text, record) => false,
    selectData: () => {}
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
      .concat([
        {
          title: 'Select',
          dataIndex: 'select',
          key: 'select',
          render: (text, record) => {
            return (
              <Radio
                checked={this.props.checked(text, record)}
                value={record.key}
                onClick={event => this.props.selectData(record.key)}
              />
            );
          }
        },
        {
          title: 'Delete',
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
        }
      ]);
    return <Table size="small" columns={columns} dataSource={data} />;
  }
}
