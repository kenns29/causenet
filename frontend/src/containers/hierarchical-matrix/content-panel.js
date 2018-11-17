import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DeckGLContainer from './deckgl-container';
import {array2Object, isArray} from '../../utils';
import {
  getClusteringMatrixLayout,
  getHierarchicalClusteringVerticalTreeLayout,
  getHierarchicalClusteringHorizontalTreeLayout,
  getClusteringMatrixCellSize,
  getClusteringMatrixPaddings,
  getRawFeatureSelection
} from '../../selectors/data';
import {
  requestToggleFeatureSelection,
  reqeustUpdateFeatureSelection
} from '../../actions';

const mapDispatchToProps = {
  requestToggleFeatureSelection,
  reqeustUpdateFeatureSelection
};

const mapStateToProps = state => ({
  colTree: getHierarchicalClusteringVerticalTreeLayout(state),
  rowTree: getHierarchicalClusteringHorizontalTreeLayout(state),
  matrix: getClusteringMatrixLayout(state),
  cellSize: getClusteringMatrixCellSize(state),
  paddings: getClusteringMatrixPaddings(state),
  featureSelection: getRawFeatureSelection(state)
});

class ContentPanel extends PureComponent {
  get containerStyle() {
    const {width, height} = this.props;
    return {
      position: 'relative',
      width,
      height
    };
  }
  _toggleFeatureSelection = feature =>
    this.props.requestToggleFeatureSelection(
      feature,
      this.props.featureSelection
    );
  /**
   * Toggle the feature cluster, this ignores non-cluster features and will
   * the cluster in the feature selection list if the cluster matches exactly
   * with the one in the parameter. If no exact match was found, the function
   * will add the cluster by performing the following steps:
   *  1) remove all non-cluster features found in the parameter cluster from
   *     the feature selection list
   *  2) remove any of the features found in the paramter cluster from every
   *     cluster features in the feature selection list
   *  3) append the parameter cluster to the feature selection list
   */
  _toggleFeatureCluster = ({isCluster, cluster}) => {
    if (!isCluster) {
      return;
    }
    const {featureSelection} = this.props;
    let features = [];
    if (featureSelection) {
      const clusterMap = array2Object(cluster, d => d.name);
      const filteredFeatures = featureSelection.filter(
        d => !isArray(d) || !d.some(name => !clusterMap.hasOwnProperty(name))
      );
      if (filteredFeatures.length === featureSelection.length) {
        filteredFeatures.forEach(d => {
          if (isArray(d)) {
            const filteredCluster = d.filter(
              name => !clusterMap.hasOwnProperty(name)
            );
            if (filteredCluster.length) {
              features.push(filteredCluster);
            }
          } else if (!clusterMap.hasOwnProperty(d)) {
            features.push(d);
          }
        });
        features.push(cluster.map(({name}) => name));
      } else {
        features = filteredFeatures;
      }
    } else {
      features = [[cluster.map(({name}) => name)]];
    }
    console.log('features', features);
  };
  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.container.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };
  onContextMenu = event => {
    if (
      this.deckGLContainer &&
      this.deckGLContainer.container &&
      this.deckGLContainer.container.deck
    ) {
      const {deck} = this.deckGLContainer.container.deck;
      const [left, top] = this._getEventMouse(event);
      const info = deck.pickObject({
        x: left,
        y: top,
        radius: 0,
        layerIds: [
          'clustering-matrix-x-axis',
          'clustering-matrix-x-axis-cluster',
          'clustering-matrix-y-axis',
          'clustering-matrix-y-axis-cluster'
        ]
      });
      if (info && info.object) {
        console.log(info.object);
        this._toggleFeatureCluster(info.object);
      }
    }
    event.preventDefault();
    event.stopPropagation();
  };
  onClick = event => {
    if (
      this.deckGLContainer &&
      this.deckGLContainer.container &&
      this.deckGLContainer.container.deck
    ) {
      const {deck} = this.deckGLContainer.container.deck;
      const [left, top] = this._getEventMouse(event);
      const info = deck.pickObject({
        x: left,
        y: top,
        radius: 0,
        layerIds: [
          'clustering-matrix-x-axis',
          'clustering-matrix-x-axis-cluster',
          'clustering-matrix-y-axis',
          'clustering-matrix-y-axis-cluster'
        ]
      });
      if (info && info.object) {
        this._toggleFeatureSelection(info.object.name);
      }
    }
    event.preventDefault();
    event.stopPropagation();
  };
  render() {
    const {matrix, colTree, rowTree} = this.props;
    return (
      <div
        ref={input => (this.container = input)}
        style={this.containerStyle}
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
      >
        {matrix &&
          colTree &&
          rowTree && (
          <DeckGLContainer
            {...this.props}
            ref={input => (this.deckGLContainer = input)}
          />
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPanel);
