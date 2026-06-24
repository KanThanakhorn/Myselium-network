import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import alertsReducer from './slices/alertsSlice';
import nodesReducer from './slices/nodesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    alerts: alertsReducer,
    nodes: nodesReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
