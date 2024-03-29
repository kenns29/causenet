import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Rnd} from 'react-rnd';
import ModelList from './model-list';
import DatasetSelect from './dataset-select';
import TrainModelButton from './train-model-button';
import TrainClusterModelButton from './train-cluster-model-button';
import ToggleNodeLinkViewLabels from './toggle-node-link-view-labels';
import HierarchicalClusteringCutThresholdSlider from './hierarchical-clustering-cut-threshold-slider';
import HierarchicalClusteringOptionRadio from './hierarchical-clustering-option-radio';
import FeatureSelectionControl from './feature-selection-control';
import ToggleHierarchicalBayesianNetwork from './toggle-hierarchical-bayesian-network';
import ToggleShowBayesianNetworkDistributionWindow from './toggle-show-bayesian-network-distribution-window';
import ToggleShowFeatureDistributionHistogramWindow from './toggle-show-feature-distribution-histogram-window';
import ToggleShowCrMatrixWindow from './toggle-show-cr-matrix-window';
import BayesianModelFeatureSlicesTable from './bayesian-model-feature-slices-table';
import CrMatrixOptions from './cr-matrix-options';
import CrMatrixFeatureSearch from './cr-matrix-feature-search';
import {updateNavPanelWidth} from '../../actions';
import {getNavPanelWidth, getContentPanelHeight} from '../../selectors/base';

const mapDispatchToProps = {updateNavPanelWidth};

const mapStateToProps = state => ({
  width: getNavPanelWidth(state),
  height: getContentPanelHeight(state)
});

class NavPanel extends PureComponent {
  render() {
    const {width, height} = this.props;
    return (
      <Rnd
        size={{width, height}}
        disableDragging
        enableResizing={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        onResizeStop={(e, dir, refToElement, delta, position) =>
          this.props.updateNavPanelWidth(width + delta.width)
        }
      >
        <DatasetSelect />
        <ModelList />
        <TrainModelButton />
        <TrainClusterModelButton />
        <ToggleNodeLinkViewLabels />
        <HierarchicalClusteringCutThresholdSlider />
        <HierarchicalClusteringOptionRadio />
        <FeatureSelectionControl />
        <ToggleHierarchicalBayesianNetwork />
        <ToggleShowBayesianNetworkDistributionWindow />
        <ToggleShowFeatureDistributionHistogramWindow />
        <BayesianModelFeatureSlicesTable />
        <ToggleShowCrMatrixWindow />
        <CrMatrixOptions />
        <CrMatrixFeatureSearch />
      </Rnd>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavPanel);
