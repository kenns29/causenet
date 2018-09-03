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
  [getContentPanelWidth, getContentPanelHeight],
  (width, height) => [width / 2, height / 2]
);

export const getTopRightSubPanelSize = createSelector(
  [getContentPanelWidth, getContentPanelHeight],
  (width, height) => [width / 2, height / 2]
);

export const getBottomLeftSubPanelSize = createSelector(
  [getContentPanelWidth, getContentPanelHeight],
  (width, height) => [width / 2, height / 2]
);

export const getBottomRightSubPanelSize = createSelector(
  [getContentPanelWidth, getContentPanelHeight],
  (width, height) => [width / 2, height / 2]
);
