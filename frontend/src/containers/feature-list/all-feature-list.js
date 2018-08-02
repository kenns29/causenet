import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {List} from 'antd';
import {getFeatureList} from '../../selectors/data';
const mapDispatchToProps = {};

const mapStateToProps = state => ({
  features: getFeatureList(state)
});

class SelectedFeatureList extends PureComponent {
  render() {
    const {features} = this.props;
    const dataSource = features || [];
    return (
      <List
        itemLayout="horizontal"
        pagination={{
          size: 'small',
          pageSize: 10
        }}
        size="small"
        dataSource={dataSource}
        renderItem={item => <List.Item>{item}</List.Item>}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectedFeatureList);
