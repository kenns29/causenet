import React from 'react';
import ModelList from './model-list';
import DatasetSelect from './dataset-select';
import TrainModelButton from './train-model-button';
import ToggleNodeLinkViewLabels from './toggle-node-link-view-labels';
import HierarchicalClusteringCutThresholdSlider from './hierarchical-clustering-cut-threshold-slider';
import HierarchicalClusteringOptionRadio from './hierarchical-clustering-option-radio';
export default () => (
  <div>
    <DatasetSelect />
    <ModelList />
    <TrainModelButton />
    <ToggleNodeLinkViewLabels />
    <HierarchicalClusteringCutThresholdSlider />
    <HierarchicalClusteringOptionRadio />
  </div>
);