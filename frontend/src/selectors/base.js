import {createSelector} from 'reselect';
import {LAYOUT} from '../constants';

export const rootSelector = state => state;

// Layout
export const getScreenWidth = createSelector(
  rootSelector,
  state => state.screenWidth
);

export const getScreenHeight = createSelector(
  rootSelector,
  state => state.screenHeight
);

export const getNavPanelWidth = createSelector(
  rootSelector,
  state => state.navPanelWidth
);

export const getContentPanelCenter = createSelector(
  rootSelector,
  state => state.contentPanelCenter
);

export const getContentPanelWidth = createSelector(
  [getScreenWidth, getNavPanelWidth],
  (screenWidth, navPanelWidth) => {
    const {CONTAINER_PADDING} = LAYOUT;
    return screenWidth - CONTAINER_PADDING * 2 - navPanelWidth;
  }
);

export const getContentPanelHeight = createSelector(getScreenHeight, height => {
  const {CONTAINER_PADDING} = LAYOUT;
  return height - CONTAINER_PADDING * 2;
});

export const getContentPanelCenterPosition = createSelector(
  [getContentPanelCenter, getContentPanelWidth, getContentPanelHeight],
  ([x, y], width, height) => [width * x, height * y]
);

export const getTopLeftSubPanelSize = createSelector(
  getContentPanelCenterPosition,
  position => position
);

export const getTopRightSubPanelSize = createSelector(
  [getContentPanelCenterPosition, getContentPanelWidth],
  ([x, y], width) => [width - x, y]
);

export const getBottomLeftSubPanelSize = createSelector(
  [getContentPanelCenterPosition, getContentPanelHeight],
  ([x, y], height) => [x, height - y]
);

export const getBottomRightSubPanelSize = createSelector(
  [getContentPanelCenterPosition, getContentPanelWidth, getContentPanelHeight],
  ([x, y], width, height) => [width - x, height - y]
);

export const getShowBayesianNetworkDistributionWindow = createSelector(
  rootSelector,
  state => state.showBayesianNetworkDistributionWindow
);

export const getBayesianNetworkDistributionWindowSize = createSelector(
  rootSelector,
  state => state.bayesianNetworkDistributionWindowSize
);

export const getShowFeatureDistributionWindow = createSelector(
  rootSelector,
  state => state.showFeatureDistributionWindow
);

export const getFeatureDistributionWindowSize = createSelector(
  rootSelector,
  state => state.featureDistributionWindowSize
);

export const getShowBayesianNetworkSubNetworkDetailWindow = createSelector(
  rootSelector,
  state => state.showBayesianNetworkSubNetworkDetailWindow
);

export const getShowCrMatrixWindow = createSelector(
  rootSelector,
  state => state.showCrMatrixWindow
);

export const getCrMatrixWindowSize = createSelector(
  rootSelector,
  state => state.crMatrixWindowSize
);

export const getShowCChordWindow = createSelector(
  rootSelector,
  state => state.showCChordWindow
);

export const getCChordWindowSize = createSelector(
  rootSelector,
  state => state.cChordWindowSize
);

export const getShowCmMatrixWindow = createSelector(
  rootSelector,
  state => state.showCmMatrixWindow
);

export const getCmMatrixWindowSize = createSelector(
  rootSelector,
  state => state.cmMatrixWindowSize
);

export const getShowCmSelectedBnWindow = createSelector(
  rootSelector,
  state => state.showCmSelectedBnWindow
);

export const getCmSelectedBnWindowSize = createSelector(
  rootSelector,
  state => state.cmSelectedBnWindowSize
);

export const getShowCmSelectedFeatureTimelineWindow = createSelector(
  rootSelector,
  state => state.showCmSelectedFeatureTimelineWindow
);

export const getCmSelectedFeatureTimelineWindowSize = createSelector(
  rootSelector,
  state => state.cmSelectedFeatureTimelineWindowSize
);

export const getShowWorldMapWindow = createSelector(
  rootSelector,
  state => state.showWorldMapWindow
);

export const getPopupWindowOrder = createSelector(
  rootSelector,
  state => state.popupWindowOrder
);
