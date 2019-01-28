// @flow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table, Button, Icon, Radio} from 'antd';

export default class DataTable extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    removeData: PropTypes.func.isRequired,
    checked: PropTypes.func.isRequired,
    selectData: PropTypes.func.isRequired,
    disableSelect: PropTypes.bool.isRequired,
    disableDelete: PropTypes.bool.isRequired
  };
  static defaultProps = {
    data: [],
    removeData: () => {},
    checked: (text, record) => false,
    selectData: () => {},
    disableSelect: false,
    disableDelete: false
  };
  _renderSelectColumn() {
    if (this.props.disableSelect) {
      return [];
    }
    return [
      {
        title: 'Select',
        dataIndex: 'select',
        key: 'select',
        render: (text, record) => {
          return (
            <Radio
              checked={this.props.checked(text, record)}
              value={record.key}
              onClick={event => this.props.selectData(record)}
            />
          );
        }
      }
    ];
  }
  _renderDeleteColumn() {
    if (this.props.disableDelete) {
      return [];
    }
    return [
      {
        title: 'Delete',
        dataIndex: 'delete',
        key: 'delete',
        render: (text, record) => {
          return (
            <Button size="small" onClick={() => this.props.removeData(record)}>
              <Icon type="delete" />
            </Button>
          );
        }
      }
    ];
  }
  render() {
    const data = this.props.data.map(d =>
      Object.entries(d).reduce(
        (o, [key, value]) => Object.assign(o, {[key]: value.toString()}),
        {}
      )
    );
    if (data.length === 0) {
      return <Table size="small" columns={[]} dataSource={data} />;
    }
    const columns = [
      ...Object.keys(data[0])
        .filter(key => key !== 'key')
        .map(key => ({
          title: key,
          dataIndex: key,
          key
        })),
      ...this._renderSelectColumn(),
      ...this._renderDeleteColumn()
    ];
    return <Table size="small" columns={columns} dataSource={data} />;
  }
}
