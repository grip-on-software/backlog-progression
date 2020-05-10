import { createSlice } from '@reduxjs/toolkit';

interface State {
  isPlaying: boolean,
  range: [number, number],
  speed: number,
}

const initialState: State = {
  isPlaying: false,
  range: [0, 0],
  speed: 1,
};

export const playSpeeds = [
  { interval: 43200000, label: "12 hours" },
  { interval: 86400000, label: "1 day" },
  { interval: 172800000, label: "2 days" },
  { interval: 345600000, label: "4 days" },
  { interval: 604800000, label: "1 week" },
  { interval: 1209600000, label: "2 weeks" }
];

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    decreaseSpeed: (state: State ) => {
      state.speed = Math.max(0, state.speed-1)
    },
    increaseSpeed: (state: State ) => {
      state.speed = Math.min(state.speed+1, playSpeeds.length-1)
    },
    pause: (state: State) => {
      state.isPlaying = false
    },
    play: (state: State) => {
      state.isPlaying = true
    },
    setRange: (state: State, { payload }: { payload: [number, number] }) => {
      state.range = payload
    },
    stop: (state: State) => {
      state.isPlaying = false
    },
  },
});

export const { decreaseSpeed, increaseSpeed, pause, play, setRange, stop } = playerSlice.actions;
export const playerSelector = (state: any) => state.player as State;
export default playerSlice.reducer;
