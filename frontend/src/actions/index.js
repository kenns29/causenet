import {fetch} from 'global';
import {createAction} from 'redux-actions';
import {BACKEND_URL} from '../constants';
// Action Ids
export const UPDATE_SCREEN_SIZE = 'UPDATE_SCREEN_SIZE';
export const FETCH_BAYESIAN_NETWORK_START = 'FETCH_BAYESIAN_NETWORK_START';
export const UPDATE_BAYESIAN_NETWORK = 'UPDATE_BAYESIAN_NETWORK';
export const UPDATE_MODEL_LIST = 'UPDATE_MODEL_LIST';

export const updateScreenSize = createAction(UPDATE_SCREEN_SIZE);
export const fetchBayesianNetworkStart = createAction(
  FETCH_BAYESIAN_NETWORK_START
);
export const updateBayesianNetwork = createAction(UPDATE_BAYESIAN_NETWORK);
export const updateModelList = createAction(UPDATE_MODEL_LIST);

export const fetchBayesianNetwork = ({
  name = 'lookalike-cut5-1'
}) => async dispatch => {
  try {
    dispatch(fetchBayesianNetworkStart());
    const response = await fetch(`${BACKEND_URL}/load_model?name=${name}`);
    const data = await response.json();
    dispatch(updateBayesianNetwork(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const fetchModelList = () => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/load_model_list`);
    const data = await response.json();
    dispatch(updateModelList(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestDeleteModel = ({name = 'model'}) => async dispatch => {
  try {
    const response = await fetch(`${BACKEND_URL}/delete_model?name=${name}`);
    const data = await response.json();
    dispatch(updateModelList(data));
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};

export const requestTrainBayesianModel = ({
  name = 'model'
}) => async dispatch => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/train_bayesian_model?name=${name}`
    );
    const data = await response.json();
    return Promise.resolve(data);
  } catch (err) {
    throw new Error(err);
  }
};
