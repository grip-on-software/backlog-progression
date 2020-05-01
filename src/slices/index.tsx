import { combineReducers } from 'redux';

import alertsReducer from './alerts';
import changesReducer from './changes';
import configReducer from './config';
import playerReducer from './player';

const rootReducer = combineReducers({
  alerts: alertsReducer,
  changes: changesReducer,
  config: configReducer,
  player: playerReducer,
});

export default rootReducer;