import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Radio} from 'antd';
import {getHierarchicalClusteringOption} from '../../selectors/data';
import {updateHierarchicalClusteringOption} from '../../actions';

import {HIERARICAL_CLUSTERING_OPTION} from '../../constants';

const mapDispatchToProps = {updateHierarchicalClusteringOption};

const mapStateToProps = state => ({
  clusteringOption: getHierarchicalClusteringOption(state)
});

class HierarchicalClusteringOptionRadio extends PureComponent {
  render() {
    const {clusteringOption} = this.props;
    const {RAW, BASE, BASE_AVG} = HIERARICAL_CLUSTERING_OPTION;
    return (
      <div>
        <span>{`Select Clustering Option `}</span>
        <Radio.Group
          compact
          size="small"
          value={clusteringOption}
          onChange={event =>
            this.props.updateHierarchicalClusteringOption(event.target.value)
          }
        >
          <Radio.Button value={RAW}>Raw</Radio.Button>
          <Radio.Button value={BASE}>Base</Radio.Button>
          <Radio.Button value={BASE_AVG}>Base Average</Radio.Button>
        </Radio.Group>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HierarchicalClusteringOptionRadio);
