import { combineReducers } from 'redux';

import alertsReducer from './alerts';
import configReducer from './config';
import playerReducer from './player';

const rootReducer = combineReducers({
  alerts: alertsReducer,
  config: configReducer,
  player: playerReducer,
});

export default rootReducer;