import { createSlice } from '@reduxjs/toolkit';

interface Alert {
  dismissible: boolean,
  message: string,
  variant: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"
}

interface State {
  alerts: Alert[]
}

const initialState: State = {
  alerts: [],
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    addAlert: (state: State, { payload }: { payload: Alert }) => {
      state.alerts.unshift(payload)
    },
    deleteAlert: (state: State, { payload }: { payload: number} ) => {
      state.alerts.splice(payload, 1);
    },
  },
});

export const { addAlert, deleteAlert } = alertsSlice.actions;
export const alertsSelector = (state: any) => state.alerts as State;
export default alertsSlice.reducer;