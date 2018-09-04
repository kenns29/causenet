import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {List, Button, Icon} from 'antd';
import {requestUpdateFeatureSelection} from '../../actions';
import {getRawFeatureSelection} from '../../selectors/data';

const mapDispatchToProps = {requestUpdateFeatureSelection};

const mapStateToProps = state => ({
  features: getRawFeatureSelection(state)
});

class FeatureList extends PureComponent {
  _deleteFeature = feature => {
    const {features} = this.props;
    const filtered = features.filter(d => d !== feature);
    this.props.requestUpdateFeatureSelection(filtered.length ? filtered : null);
  };
  _renderDelete = feature => (
    <Button size="small" onClick={() => this._deleteFeature(feature)}>
      <Icon type="delete" />
    </Button>
  );
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
          renderItem={feature => (
            <List.Item actions={[this._renderDelete(feature)]}>
              {feature}
            </List.Item>
          )}
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
