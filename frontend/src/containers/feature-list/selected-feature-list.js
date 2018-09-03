import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {List} from 'antd';
import {getRawFeatureSelection} from '../../selectors/data';
const mapDispatchToProps = {};

const mapStateToProps = state => ({
  features: getRawFeatureSelection(state)
});

class FeatureList extends PureComponent {
  render() {
    const {features, height} = this.props;
    const dataSource = features || [];
    return (
      <div style={{height, overflow: 'auto'}}>
        <List
          itemLayout="horizontal"
          pagination={{
            size: 'small',
            pageSize: Math.floor(height / 40)
          }}
          dataSource={dataSource}
          size="small"
          renderItem={item => <List.Item>{item}</List.Item>}
          style={{marginLeft: 5}}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureList);
