import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { addAlert } from './alerts';

interface Change {
  id: number,
  created: number,
}

interface Issue {
  id: number,
  label: string,
  created: number,
  lastChange: Change,
}

export interface Sprint {
  id: number | null,
  label: string,
  issues?: Issue[],
}

interface State {
  changelog: Change[],
  sprints: Sprint[],
}

const initialState: State = {
  changelog: [],
  sprints: [
    {
      id: null,
      label: "Backlog",
      issues: []
    }
  ],
};

const changesSlice = createSlice({
  name: "changes",
  initialState,
  reducers: {
    addSprint: (state: State, { payload }: { payload: Sprint }) => {
      state.sprints.push(payload)
    },
    applyChanges: (state: State, { payload }: { payload: { from: number, to: number } }) => {
      console.log("Apply change", payload.from, payload.to);
    },
    deleteSprint: (state: State, { payload }: { payload: number }) => {
      const sprint = state.sprints.find(sprint => payload === sprint.id);
      if (sprint?.issues?.length) {
        const backlog = state.sprints.find(sprint => null === sprint.id);
        sprint.issues.forEach(issue => backlog?.issues?.push(issue));
      }
      state.sprints = state.sprints.filter(sprint => payload !== sprint.id);
    },
    setChangelog: (state: State, { payload }: { payload: Change[] }) => {
      state.changelog = payload
    },
    undoChanges: (state: State, { payload }: { payload: { from: number } }) => {
      console.log("Undo changes", payload.from);
    },
    updateSprint: (state: State, { payload }: { payload: Sprint }) => {
      const i = state.sprints.findIndex(s => payload.id === s.id);
      if (-1 !== i) state.sprints[i].label = payload.label;
    },
  },
});

export const { addSprint, applyChanges, deleteSprint, setChangelog, undoChanges, updateSprint } = changesSlice.actions;
export const changesSelector = (state: any) => state.changes as State;
export default changesSlice.reducer;

export const fetchChangelog = (projectKey: string) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await fetch("data/IES/changelog.json");
      const data: Change[] = await response.json();
      dispatch(setChangelog(data));
    } catch (error) {
      console.error(error);
      dispatch(addAlert({
        dismissible: false,
        message: "Something went wrong while fetching project history. Please reload the page.",
        variant: "danger"
      }));
    }
  }
}