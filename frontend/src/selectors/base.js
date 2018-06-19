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

export const getContentPanelWidth = createSelector(
  [getScreenWidth, getScreenHeight],
  (width, height) => {
    const {NAV_PANEL_WIDTH, CONTAINER_PADDING} = LAYOUT;
    return width - CONTAINER_PADDING * 2 - NAV_PANEL_WIDTH;
  }
);

export const getContentPanelHeight = createSelector(getScreenHeight, height => {
  const {CONTAINER_PADDING} = LAYOUT;
  return height - CONTAINER_PADDING * 2;
});
