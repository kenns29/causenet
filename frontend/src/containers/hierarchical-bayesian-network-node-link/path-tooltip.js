import React, {PureComponent} from 'react';
import DeckGL, {OrthographicView} from 'deck.gl';
import {array2Object} from '../../utils';
export default class PathTooltip extends PureComponent {
  _getPathLayout() {
    const {path} = this.props;
    const [marginLeft, marginTop] = [5, 5];
    const [nw, nh] = [5, 5];
    const l = 10;
    const nodes = path.map(({node}, index) => ({
      ...node,
      x: marginLeft + index * (nw + l) + nw / 2,
      y: marginTop + nh / 2
    }));
    const links = path.slice(1).map(({weight}, index) => ({
      source: nodes[index - 2],
      target: nodes[index - 1],
      weight
    }));
    return {nodes, links};
  }
  _renderNodes(nodes) {}
  _renderLinks(links) {}
  _renderLayers() {
    const {nodes, links} = this._getPathLayout();
    return [];
  }
  render() {
    const {path} = this.props;
    return <DeckGL layers={this._renderLayers()} />;
  }
}
