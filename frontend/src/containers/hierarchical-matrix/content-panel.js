import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import DeckGLContainer from './deckgl-container';
import {
  getClusteringMatrixLayout,
  getHierarchicalClusteringVerticalTreeLayout,
  getHierarchicalClusteringHorizontalTreeLayout,
  getClusteringMatrixCellSize,
  getClusteringMatrixPaddings,
  getRawFeatureSelection
} from '../../selectors/data';
import {requestToggleFeatureSelection} from '../../actions';

const mapDispatchToProps = {
  requestToggleFeatureSelection
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
